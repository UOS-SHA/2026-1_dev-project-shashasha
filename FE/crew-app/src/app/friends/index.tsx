import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const initialFriends = [
  { name: '김민지', status: '공강 많음', color: '#5B7FFF', id: '@minji' },
  { name: '이서연', status: '오후 가능', color: '#F97316', id: '@seoyeon' },
  { name: '박지훈', status: '수요일 추천', color: '#10B981', id: '@jihun' },
  { name: '최예은', status: '친구 추가됨', color: '#F43F5E', id: '@yeeun' },
  { name: '정하늘', status: '시간표 확인', color: '#0EA5E9', id: '@haneul' },
];

const meetingTimes = [
  { room: '김민지, 이서연 외 2', time: '이번 주 수요일 오후 3시', agree: '3/4명 찬성', status: 'vote' },
  { room: '박지훈, 최예은', time: '4월 26일 오후 2시', agree: '전원 찬성', status: 'calbok' },
  { room: '정하늘, 김민지 외 1', time: '다음 주 금요일 저녁 7시', agree: '1/4명 찬성', status: 'vote' },
] as const;

const initialChatRooms = [
  { id: 'room-1', name: '김민지, 이서연 외 2', message: '나는 3시 이후 가능해!', time: '방금', unread: 2 },
  { id: 'room-2', name: '박지훈, 최예은', message: '장소는 학교 앞 카페 어때?', time: '1시간 전', unread: 0 },
  { id: 'room-3', name: '정하늘, 김민지 외 1', message: '그럼 목요일 저녁 후보로 잡아둘게', time: '어제', unread: 1 },
];

const friendSchedules: Record<string, { day: string; title: string; time: string; type: string }[]> = {
  '@minji': [
    { day: '월', title: '전공 수업', time: '10:00 - 12:00', type: '고정' },
    { day: '수', title: '동아리 회의', time: '15:00 - 17:00', type: '변동' },
    { day: '금', title: '알바', time: '18:00 - 21:00', type: '고정' },
  ],
  '@seoyeon': [
    { day: '화', title: '교양 수업', time: '13:00 - 15:00', type: '고정' },
    { day: '목', title: '스터디', time: '16:00 - 18:00', type: '변동' },
  ],
  '@jihun': [
    { day: '월', title: '랩 미팅', time: '14:00 - 16:00', type: '고정' },
    { day: '금', title: '운동', time: '09:00 - 10:30', type: '변동' },
  ],
  '@yeeun': [
    { day: '수', title: '수업', time: '09:00 - 12:00', type: '고정' },
    { day: '토', title: '프로젝트', time: '13:00 - 16:00', type: '변동' },
  ],
  '@haneul': [
    { day: '화', title: '알바', time: '17:00 - 21:00', type: '고정' },
    { day: '목', title: '팀플', time: '11:00 - 13:00', type: '변동' },
  ],
};

const scheduleDays = ['월', '화', '수', '목', '금', '토', '일'];
const scheduleHours = Array.from({ length: 13 }, (_, index) => index + 9);

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <ThemedText style={styles.avatarText}>{name[0]}</ThemedText>
    </View>
  );
}

export default function FriendsHomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [friends, setFriends] = useState(initialFriends);
  const [chatRooms, setChatRooms] = useState(initialChatRooms);
  const [menuOpen, setMenuOpen] = useState(false);
  const [friendFormOpen, setFriendFormOpen] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<(typeof initialFriends)[number] | null>(null);
  const [chatFormOpen, setChatFormOpen] = useState(false);
  const [chatRoomName, setChatRoomName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  const openFriendForm = () => {
    setMenuOpen(false);
    setFriendFormOpen(true);
  };

  const openChatForm = () => {
    setMenuOpen(false);
    setChatFormOpen(true);
  };

  const addFriendById = () => {
    const trimmedId = friendId.trim();

    if (!trimmedId) {
      Alert.alert('아이디를 입력해주세요', '친구 아이디를 입력하면 시간표를 확인할 수 있어요.');
      return;
    }

    const normalizedId = trimmedId.startsWith('@') ? trimmedId : `@${trimmedId}`;
    const alreadyExists = friends.some((friend) => friend.id === normalizedId);

    if (alreadyExists) {
      Alert.alert('이미 추가된 친구예요', `${normalizedId}는 친구 목록에 있어요.`);
      return;
    }

    setFriends((current) => [
      {
        name: normalizedId.replace('@', ''),
        status: '새 친구',
        color: '#7C3AED',
        id: normalizedId,
      },
      ...current,
    ]);
    setFriendId('');
    setFriendFormOpen(false);
  };

  const searchKeyword = searchQuery.trim().toLowerCase();
  const searchedFriends = searchKeyword
    ? friends.filter((friend) => {
        return (
          friend.name.toLowerCase().includes(searchKeyword) ||
          friend.id.toLowerCase().includes(searchKeyword)
        );
      })
    : friends;
  const selectedSchedule = selectedFriend ? friendSchedules[selectedFriend.id] ?? [] : [];
  const selectedChatFriends = friends.filter((friend) => selectedFriendIds.includes(friend.id));
  const previewChatName =
    chatRoomName.trim() || selectedChatFriends.map((friend) => friend.name).join(', ');

  const toggleChatFriend = (friendIdForRoom: string) => {
    setSelectedFriendIds((current) =>
      current.includes(friendIdForRoom)
        ? current.filter((id) => id !== friendIdForRoom)
        : [...current, friendIdForRoom],
    );
  };

  const createChatRoom = () => {
    if (selectedFriendIds.length === 0) {
      Alert.alert('친구를 선택해주세요', '단톡방에 초대할 친구를 1명 이상 선택해야 해요.');
      return;
    }

    const roomName = previewChatName || '새 단톡방';
    const newRoom = {
      id: `room-${Date.now()}`,
      name: roomName,
      message: '새 단톡방이 만들어졌어요.',
      time: '방금',
      unread: 0,
    };

    setChatRooms((current) => [newRoom, ...current]);
    setChatRoomName('');
    setSelectedFriendIds([]);
    setChatFormOpen(false);
  };
  const getScheduleForCell = (day: string, hour: number) => {
    return selectedSchedule.find((schedule) => {
      const [start, end] = schedule.time.split(' - ');
      const startHour = Number(start.split(':')[0]);
      const endHour = Number(end.split(':')[0]);

      return schedule.day === day && hour >= startHour && hour < endHour;
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: safeAreaInsets.top + Spacing.three,
            paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          },
        ]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText style={styles.eyebrow}>SHASHASHA 친구탭</ThemedText>
              <ThemedText style={styles.title}>친구</ThemedText>
              <ThemedText style={styles.description}>
                친구 시간표를 모아 보고, 단톡방에서 가능한 모임 시간을 정해요.
              </ThemedText>
            </View>

            <View style={styles.addArea}>
              <Pressable
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                onPress={() => setMenuOpen((current) => !current)}>
                <ThemedText style={styles.addButtonText}>+</ThemedText>
              </Pressable>

              {menuOpen && (
                <View style={styles.addMenu}>
                  <Pressable style={styles.menuItem} onPress={openFriendForm}>
                    <ThemedText style={styles.menuTitle}>친구 추가</ThemedText>
                    <ThemedText style={styles.menuSub}>아이디로 검색</ThemedText>
                  </Pressable>
                  <View style={styles.menuDivider} />
                  <Pressable
                    style={styles.menuItem}
                    onPress={openChatForm}>
                    <ThemedText style={styles.menuTitle}>단톡방 추가</ThemedText>
                    <ThemedText style={styles.menuSub}>친구 모아 시간 추천</ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>친구 목록</ThemedText>
            <View style={styles.friendHeaderActions}>
              <Pressable style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]} onPress={() => setSearchOpen(true)}>
                <ThemedText style={styles.searchButtonText}>⌕</ThemedText>
              </Pressable>
              <ThemedText style={styles.sectionMeta}>{friends.length}명</ThemedText>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendScroll}>
            {friends.map((friend) => (
              <Pressable
                key={friend.id}
                style={({ pressed }) => [styles.friendItem, pressed && styles.pressed]}
                onPress={() => setSelectedFriend(friend)}>
                <Avatar name={friend.name} color={friend.color} />
                <ThemedText style={styles.friendName}>{friend.name}</ThemedText>
                <ThemedText style={styles.friendStatus}>{friend.status}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.recommendCard}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>고려 중인 모임 시간</ThemedText>
              <Pressable style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}>
                <ThemedText style={styles.smallButtonText}>다시 추천</ThemedText>
              </Pressable>
            </View>

            {meetingTimes.map((slot) => {
              const done = slot.status === 'calbok';

              return (
                <View key={`${slot.room}-${slot.time}`} style={styles.timeRow}>
                  <View style={styles.timeTextBlock}>
                    <ThemedText style={styles.roomText}>{slot.room}</ThemedText>
                    <ThemedText style={styles.timeText}>{slot.time}</ThemedText>
                    <ThemedText style={styles.timeSub}>{slot.agree}</ThemedText>
                  </View>
                  <Pressable style={[styles.agreeButton, done && styles.calbokButton]}>
                    <ThemedText style={[styles.agreeText, done && styles.calbokButtonText]}>
                      {done ? '캘박 완료' : '찬성'}
                    </ThemedText>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>단톡방</ThemedText>
          </View>

          <View style={styles.chatList}>
            {chatRooms.map((room, index) => (
              <Pressable
                key={room.id}
                style={({ pressed }) => [
                  styles.chatRoom,
                  index === chatRooms.length - 1 && styles.lastChatRoom,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/friends/chat/[id]',
                    params: { id: room.id, name: room.name },
                  })
                }>
                <View style={styles.avatarStack}>
                  <View style={[styles.stackMain, { backgroundColor: friends[index]?.color ?? '#5B7FFF' }]}>
                    <ThemedText style={styles.avatarText}>{room.name[0]}</ThemedText>
                  </View>
                  <View style={[styles.stackSub, { backgroundColor: friends[(index + 1) % friends.length]?.color ?? '#F97316' }]}>
                    <ThemedText style={styles.stackSubText}>{room.name[4] ?? '+'}</ThemedText>
                  </View>
                </View>
                <View style={styles.chatText}>
                  <ThemedText style={styles.chatName}>{room.name}</ThemedText>
                  <ThemedText style={styles.chatMessage} numberOfLines={1}>
                    {room.message}
                  </ThemedText>
                </View>
                <View style={styles.chatMeta}>
                  <ThemedText style={styles.chatTime}>{room.time}</ThemedText>
                  {room.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <ThemedText style={styles.unreadText}>{room.unread}</ThemedText>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={friendFormOpen}
        onRequestClose={() => setFriendFormOpen(false)}>
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFriendFormOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.sectionHeader}>
              <View style={styles.modalTitleBlock}>
                <ThemedText style={styles.sectionTitle}>친구 추가</ThemedText>
                <ThemedText style={styles.modalSub}>친구 아이디를 입력해 시간표를 확인해요.</ThemedText>
              </View>
              <Pressable onPress={() => setFriendFormOpen(false)}>
                <ThemedText style={styles.closeText}>닫기</ThemedText>
              </Pressable>
            </View>
            <TextInput
              value={friendId}
              onChangeText={setFriendId}
              placeholder="@friend_id"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              style={styles.input}
            />
            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={addFriendById}>
              <ThemedText style={styles.primaryButtonText}>아이디로 친구 추가</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalHint}>
              추천: QR 코드, 초대 링크, 학교 이메일 검색으로도 친구 추가를 확장할 수 있어요.
            </ThemedText>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={searchOpen}
        onRequestClose={() => setSearchOpen(false)}>
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSearchOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.sectionHeader}>
              <View style={styles.modalTitleBlock}>
                <ThemedText style={styles.sectionTitle}>친구 검색</ThemedText>
                <ThemedText style={styles.modalSub}>이름이나 아이디로 친구를 찾아요.</ThemedText>
              </View>
              <Pressable onPress={() => setSearchOpen(false)}>
                <ThemedText style={styles.closeText}>닫기</ThemedText>
              </Pressable>
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="이름 또는 @id"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              style={styles.input}
            />
            <ScrollView style={styles.searchResults} contentContainerStyle={styles.searchResultsContent}>
              {searchedFriends.length > 0 ? (
                searchedFriends.map((friend) => (
                  <Pressable
                    key={`search-${friend.id}`}
                    style={({ pressed }) => [styles.searchResultRow, pressed && styles.pressed]}
                    onPress={() => {
                      setSearchOpen(false);
                      setSelectedFriend(friend);
                    }}>
                    <Avatar name={friend.name} color={friend.color} />
                    <View style={styles.searchResultText}>
                      <ThemedText style={styles.searchResultName}>{friend.name}</ThemedText>
                      <ThemedText style={styles.searchResultId}>{friend.id}</ThemedText>
                    </View>
                    <ThemedText style={styles.searchResultStatus}>{friend.status}</ThemedText>
                  </Pressable>
                ))
              ) : (
                <ThemedText style={styles.emptySearchText}>검색 결과가 없어요.</ThemedText>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={chatFormOpen}
        onRequestClose={() => setChatFormOpen(false)}>
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setChatFormOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.sectionHeader}>
              <View style={styles.modalTitleBlock}>
                <ThemedText style={styles.sectionTitle}>단톡방 추가</ThemedText>
                <ThemedText style={styles.modalSub}>친구를 선택해서 새 단톡방을 만들어요.</ThemedText>
              </View>
              <Pressable onPress={() => setChatFormOpen(false)}>
                <ThemedText style={styles.closeText}>닫기</ThemedText>
              </Pressable>
            </View>

            <TextInput
              value={chatRoomName}
              onChangeText={setChatRoomName}
              placeholder="단톡방 이름 (선택)"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <View style={styles.chatPreviewBox}>
              <ThemedText style={styles.chatPreviewLabel}>미리보기</ThemedText>
              <ThemedText style={styles.chatPreviewName} numberOfLines={1}>
                {previewChatName || '친구를 선택해주세요'}
              </ThemedText>
            </View>

            <ScrollView style={styles.createRoomFriendList} contentContainerStyle={styles.createRoomFriendContent}>
              {friends.map((friend) => {
                const selected = selectedFriendIds.includes(friend.id);

                return (
                  <Pressable
                    key={`create-${friend.id}`}
                    style={({ pressed }) => [
                      styles.createRoomFriendRow,
                      selected && styles.createRoomFriendSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => toggleChatFriend(friend.id)}>
                    <Avatar name={friend.name} color={friend.color} />
                    <View style={styles.searchResultText}>
                      <ThemedText style={styles.searchResultName}>{friend.name}</ThemedText>
                      <ThemedText style={styles.searchResultId}>{friend.id}</ThemedText>
                    </View>
                    <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
                      <ThemedText style={[styles.checkCircleText, selected && styles.checkCircleTextSelected]}>
                        {selected ? '✓' : ''}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={createChatRoom}>
              <ThemedText style={styles.primaryButtonText}>단톡방 만들기</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalHint}>
              현재는 화면 확인용 생성이며, 실제 저장은 이후 채팅방 생성 API와 연결할 예정이에요.
            </ThemedText>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={selectedFriend !== null}
        onRequestClose={() => setSelectedFriend(null)}>
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedFriend(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            {selectedFriend && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.friendScheduleTitle}>
                    <Avatar name={selectedFriend.name} color={selectedFriend.color} />
                    <View style={styles.modalTitleBlock}>
                      <ThemedText style={styles.sectionTitle}>{selectedFriend.name} 시간표</ThemedText>
                      <ThemedText style={styles.modalSub}>{selectedFriend.id}의 저장된 시간표 미리보기</ThemedText>
                    </View>
                  </View>
                  <Pressable onPress={() => setSelectedFriend(null)}>
                    <ThemedText style={styles.closeText}>닫기</ThemedText>
                  </Pressable>
                </View>

                <ScrollView style={styles.scheduleTableScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.scheduleTable}>
                    <View style={styles.scheduleHeaderRow}>
                      <View style={styles.scheduleTimeHeaderCell} />
                      {scheduleDays.map((day) => (
                        <View key={`header-${day}`} style={styles.scheduleDayHeaderCell}>
                          <ThemedText style={styles.scheduleDayHeaderText}>{day}</ThemedText>
                        </View>
                      ))}
                    </View>

                    {scheduleHours.map((hour) => (
                      <View key={`hour-${hour}`} style={styles.scheduleGridRow}>
                        <View style={styles.scheduleTimeCell}>
                          <ThemedText style={styles.scheduleTimeCellText}>{hour}</ThemedText>
                        </View>
                        {scheduleDays.map((day) => {
                          const schedule = getScheduleForCell(day, hour);
                          const isStartHour = schedule ? Number(schedule.time.split(' - ')[0].split(':')[0]) === hour : false;

                          return (
                            <View key={`${day}-${hour}`} style={[styles.scheduleGridCell, schedule && styles.scheduleFilledCell]}>
                              {schedule && isStartHour && (
                                <>
                                  <ThemedText style={styles.scheduleCellTitle} numberOfLines={1}>
                                    {schedule.title}
                                  </ThemedText>
                                  <ThemedText style={styles.scheduleCellTime} numberOfLines={1}>
                                    {schedule.time}
                                  </ThemedText>
                                </>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <ThemedText style={styles.modalHint}>
                  현재는 확인용 시간표이며, 실제 데이터 연동 시 personal-schedule 저장 데이터 또는 API 응답으로 교체할 예정이에요.
                </ThemedText>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FB' },
  content: { alignItems: 'center', paddingHorizontal: Spacing.three },
  container: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three, zIndex: 2 },
  headerText: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#5B7FFF', fontSize: 13, fontWeight: '800' },
  title: { color: '#1E1E2E', fontSize: 30, fontWeight: '900', lineHeight: 38, marginTop: 4 },
  description: { color: '#64748B', fontSize: 14, lineHeight: 21, marginTop: 4 },
  addArea: { position: 'relative', zIndex: 3 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', lineHeight: 30 },
  addMenu: {
    position: 'absolute',
    right: 0,
    top: 56,
    width: 168,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    padding: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  menuItem: { padding: 10, borderRadius: 10 },
  menuTitle: { color: '#1E1E2E', fontSize: 13, fontWeight: '900' },
  menuSub: { color: '#94A3B8', fontSize: 11, fontWeight: '700', marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },
  closeText: { color: '#64748B', fontSize: 12, fontWeight: '900' },
  input: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#1E1E2E',
    fontSize: 14,
    paddingHorizontal: 12,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  modalLayer: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    zIndex: 0,
  },
  modalCard: {
    zIndex: 1,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 2,
  },
  modalTitleBlock: { flex: 1, minWidth: 0 },
  modalSub: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 3 },
  modalHint: { color: '#94A3B8', fontSize: 11, lineHeight: 17 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { color: '#1E1E2E', fontSize: 17, fontWeight: '900' },
  sectionMeta: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  friendHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDE4FF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: { color: '#5B7FFF', fontSize: 24, fontWeight: '900', lineHeight: 26 },
  searchResults: { maxHeight: 280 },
  searchResultsContent: { gap: 8 },
  searchResultRow: {
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchResultText: { flex: 1, minWidth: 0 },
  searchResultName: { color: '#1E1E2E', fontSize: 13, fontWeight: '900' },
  searchResultId: { color: '#94A3B8', fontSize: 11, fontWeight: '800', marginTop: 2 },
  searchResultStatus: { color: '#64748B', fontSize: 11, fontWeight: '800' },
  emptySearchText: { color: '#94A3B8', fontSize: 13, fontWeight: '800', textAlign: 'center', paddingVertical: 18 },
  chatPreviewBox: {
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    padding: 11,
    gap: 3,
  },
  chatPreviewLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '900' },
  chatPreviewName: { color: '#1E1E2E', fontSize: 14, fontWeight: '900' },
  createRoomFriendList: { maxHeight: 250 },
  createRoomFriendContent: { gap: 8 },
  createRoomFriendRow: {
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  createRoomFriendSelected: { backgroundColor: '#EEF2FF', borderColor: '#B8C7FF' },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: { backgroundColor: '#5B7FFF', borderColor: '#5B7FFF' },
  checkCircleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', lineHeight: 15 },
  checkCircleTextSelected: { color: '#FFFFFF' },
  friendScheduleTitle: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  scheduleTableScroll: { maxHeight: 430 },
  scheduleTable: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#E8EDF3',
    backgroundColor: '#FFFFFF',
  },
  scheduleHeaderRow: { flexDirection: 'row', minHeight: 30 },
  scheduleGridRow: { flexDirection: 'row', minHeight: 46 },
  scheduleTimeHeaderCell: {
    width: 30,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EDF3',
    backgroundColor: '#F8FAFC',
  },
  scheduleDayHeaderCell: {
    flex: 1,
    minWidth: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EDF3',
    backgroundColor: '#F8FAFC',
  },
  scheduleDayHeaderText: { color: '#475569', fontSize: 11, fontWeight: '900' },
  scheduleTimeCell: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EDF3',
    backgroundColor: '#F8FAFC',
  },
  scheduleTimeCellText: { color: '#94A3B8', fontSize: 10, fontWeight: '800' },
  scheduleGridCell: {
    flex: 1,
    minWidth: 34,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EDF3',
    paddingHorizontal: 2,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
  },
  scheduleFilledCell: { backgroundColor: '#EAF0FF' },
  scheduleCellTitle: { color: '#3652C8', fontSize: 9, fontWeight: '900', textAlign: 'center' },
  scheduleCellTime: { color: '#64748B', fontSize: 7, fontWeight: '800', textAlign: 'center', marginTop: 1 },
  readOnlyBadge: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  readOnlyBadgeText: { color: '#5B7FFF', fontSize: 11, fontWeight: '900' },
  friendScheduleList: { maxHeight: 300 },
  friendScheduleContent: { gap: 8 },
  scheduleRow: {
    minHeight: 62,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  scheduleDay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleDayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  scheduleTextBlock: { flex: 1, minWidth: 0 },
  scheduleTitle: { color: '#1E1E2E', fontSize: 13, fontWeight: '900' },
  scheduleTime: { color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 3 },
  scheduleTypeBadge: { borderRadius: 12, backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 4 },
  scheduleTypeText: { color: '#7C3AED', fontSize: 10, fontWeight: '900' },
  friendScroll: { gap: 10, paddingRight: 8 },
  friendItem: {
    width: 88,
    minHeight: 110,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 6,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  friendName: { color: '#1E1E2E', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  friendStatus: { color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  recommendCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE4FF',
    padding: 14,
    gap: 10,
  },
  smallButton: { borderRadius: 18, backgroundColor: '#EDE9FE', paddingHorizontal: 12, paddingVertical: 6 },
  smallButtonText: { color: '#7C3AED', fontSize: 11, fontWeight: '900' },
  timeRow: {
    minHeight: 66,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
  },
  timeTextBlock: { flex: 1, minWidth: 0 },
  roomText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
  timeText: { color: '#1E1E2E', fontSize: 14, fontWeight: '800', marginTop: 2 },
  timeSub: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginTop: 2 },
  agreeButton: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#5B7FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  calbokButton: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  agreeText: { color: '#5B7FFF', fontSize: 11, fontWeight: '900' },
  calbokButtonText: { color: '#15803D' },
  chatList: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    overflow: 'hidden',
  },
  chatRoom: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  lastChatRoom: { borderBottomWidth: 0 },
  avatarStack: { width: 50, height: 50 },
  stackMain: { position: 'absolute', left: 0, top: 0, width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stackSub: { position: 'absolute', right: 0, bottom: 0, width: 27, height: 27, borderRadius: 14, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stackSubText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  chatText: { flex: 1, minWidth: 0 },
  chatName: { color: '#1E1E2E', fontSize: 15, fontWeight: '900' },
  chatMessage: { color: '#94A3B8', fontSize: 13, marginTop: 5, lineHeight: 18 },
  chatMeta: { minWidth: 44, alignItems: 'flex-end', gap: 7 },
  chatTime: { color: '#94A3B8', fontSize: 11, fontWeight: '800' },
  unreadBadge: { minWidth: 19, height: 19, borderRadius: 10, backgroundColor: '#5B7FFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  pressed: { opacity: 0.72 },
});
