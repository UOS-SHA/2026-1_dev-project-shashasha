import { useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  time: string;
  mine: boolean;
  pollOptions?: MeetingPoll[];
  pollCompleted?: boolean;
};

type MeetingPoll = {
  id: string;
  time: string;
  voters: number;
  voted: boolean;
};

const chatDetails: Record<string, { name: string; members: string[]; active: string; messages: ChatMessage[] }> = {
  'room-1': {
    name: '김민지, 이서연 외 2',
    members: ['나', '김민지', '이서연', '박지훈'],
    active: '방금 활동',
    messages: [
      { id: '1', sender: '김민지', text: '이번 주 수요일 다들 괜찮아?', time: '오후 2:10', mine: false },
      { id: '2', sender: '나', text: '나는 3시 이후 가능해!', time: '오후 2:12', mine: true },
      { id: '3', sender: '이서연', text: '나도 3시 좋아', time: '오후 2:13', mine: false },
      { id: '4', sender: '박지훈', text: '수업 끝나고 바로 갈게', time: '오후 2:15', mine: false },
    ],
  },
  'room-2': {
    name: '박지훈, 최예은',
    members: ['나', '박지훈', '최예은'],
    active: '1시간 전 활동',
    messages: [
      { id: '1', sender: '최예은', text: '토요일에 만나는 거 맞지?', time: '오전 11:02', mine: false },
      { id: '2', sender: '나', text: '응 오후 2시!', time: '오전 11:04', mine: true },
      { id: '3', sender: '박지훈', text: '장소는 학교 앞 카페 어때?', time: '오전 11:08', mine: false },
    ],
  },
  'room-3': {
    name: '정하늘, 김민지 외 1',
    members: ['나', '정하늘', '김민지', '이서연'],
    active: '어제 활동',
    messages: [
      { id: '1', sender: '정하늘', text: '다음 주는 목요일이 제일 널널해', time: '어제', mine: false },
      { id: '2', sender: '김민지', text: '나는 저녁 가능!', time: '어제', mine: false },
      { id: '3', sender: '나', text: '그럼 목요일 저녁 후보로 잡아둘게', time: '어제', mine: true },
    ],
  },
};

const initialPolls: MeetingPoll[] = [
  { id: 'poll-1', time: '이번 주 수요일 오후 3시', voters: 2, voted: false },
  { id: 'poll-2', time: '이번 주 금요일 오후 6시', voters: 1, voted: false },
  { id: 'poll-3', time: '다음 주 월요일 오후 2시', voters: 0, voted: false },
];

const inviteCandidates = ['최예은', '정하늘', '강도윤', '한서아', '윤지우'];

function formatNow() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${period} ${displayHour}:${minutes}`;
}

export default function FriendChatRoomScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const room = chatDetails[id ?? 'room-1'] ?? chatDetails['room-1'];
  const displayRoomName = name ?? room.name;
  const scrollViewRef = useRef<ScrollView>(null);
  const [members, setMembers] = useState(room.members);
  const [messages, setMessages] = useState<ChatMessage[]>(room.messages);
  const [messageText, setMessageText] = useState('');
  const [actionOpen, setActionOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [polls, setPolls] = useState<MeetingPoll[]>(initialPolls);
  const filteredInviteCandidates = inviteCandidates.filter((candidate) =>
    candidate.toLowerCase().includes(inviteQuery.trim().toLowerCase()),
  );

  const sendMessage = () => {
    const trimmedText = messageText.trim();

    if (!trimmedText) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `mine-${Date.now()}`,
        sender: '나',
        text: trimmedText,
        time: formatNow(),
        mine: true,
      },
    ]);
    setMessageText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const toggleVote = (pollId: string) => {
    setPolls((current) =>
      current.map((poll) => {
        if (poll.id !== pollId) {
          return poll;
        }

        return {
          ...poll,
          voters: poll.voted ? Math.max(0, poll.voters - 1) : poll.voters + 1,
          voted: !poll.voted,
        };
      }),
    );
  };

  const sharePollToChat = () => {
    setMessages((current) => [
      ...current,
      {
        id: `poll-${Date.now()}`,
        sender: '나',
        text: '모임 시간 추천',
        time: formatNow(),
        mine: true,
        pollOptions: polls,
      },
    ]);
    setPollOpen(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const voteOnSharedPoll = (messageId: string, pollId: string) => {
    setMessages((current) => {
      let shouldSendCalbokMessage = false;

      const nextMessages = current.map((message) => {
        if (message.id !== messageId || !message.pollOptions) {
          return message;
        }

        let completed = message.pollCompleted;
        const nextPollOptions = message.pollOptions.map((poll) => {
          if (poll.id !== pollId) {
            return poll;
          }

          const nextVoters = poll.voted ? Math.max(0, poll.voters - 1) : poll.voters + 1;

          if (!message.pollCompleted && nextVoters >= members.length) {
            completed = true;
            shouldSendCalbokMessage = true;
          }

          return {
            ...poll,
            voters: nextVoters,
            voted: !poll.voted,
          };
        });

        return {
          ...message,
          pollOptions: nextPollOptions,
          pollCompleted: completed,
        };
      });

      if (!shouldSendCalbokMessage) {
        return nextMessages;
      }

      return [
        ...nextMessages,
        {
          id: `calbok-${Date.now()}`,
          sender: 'SHASHASHA',
          text: '캘박 완료되었습니다.',
          time: formatNow(),
          mine: false,
        },
      ];
    });
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const inviteFriend = (friendName: string) => {
    if (members.includes(friendName)) {
      return;
    }

    setMembers((current) => [...current, friendName]);
    setMessages((current) => [
      ...current,
      {
        id: `invite-${Date.now()}`,
        sender: 'SHASHASHA',
        text: `${friendName}님을 단톡방에 초대했어요.`,
        time: formatNow(),
        mine: false,
      },
    ]);
    setInviteOpen(false);
    setInviteQuery('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 10 }]}>
        <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>‹</ThemedText>
        </Pressable>
        <View style={styles.headerText}>
          <ThemedText style={styles.roomName} numberOfLines={1}>
            {displayRoomName}
          </ThemedText>
          <ThemedText style={styles.roomMeta}>
            {members.length}명 · {room.active}
          </ThemedText>
        </View>
        <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} onPress={() => setMemberOpen(true)}>
          <ThemedText style={styles.moreButtonText}>⋯</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: safeAreaInsets.bottom + 92 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.datePill}>
          <ThemedText style={styles.datePillText}>오늘</ThemedText>
        </View>

        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.mine && styles.myMessageRow]}>
            {!message.mine && (
              <View style={styles.senderAvatar}>
                <ThemedText style={styles.senderAvatarText}>{message.sender[0]}</ThemedText>
              </View>
            )}

            <View style={[styles.messageBlock, message.mine && styles.myMessageBlock]}>
              {!message.mine && <ThemedText style={styles.senderName}>{message.sender}</ThemedText>}
              <View style={[styles.bubbleWrap, message.mine && styles.myBubbleWrap]}>
                {message.mine && <ThemedText style={styles.messageTime}>{message.time}</ThemedText>}
                {message.pollOptions ? (
                  <View style={styles.noticeCard}>
                    <View style={styles.noticeHeader}>
                      <ThemedText style={styles.noticeLabel}>공지</ThemedText>
                      <ThemedText style={styles.noticeTitle}>모임 시간 추천</ThemedText>
                    </View>
                    <View style={styles.noticeOptionList}>
                      {message.pollOptions.map((poll) => (
                        <View key={`${message.id}-${poll.id}`} style={styles.noticeOption}>
                          <View style={styles.noticeOptionTextBlock}>
                            <ThemedText style={styles.noticeOptionTime}>{poll.time}</ThemedText>
                            <ThemedText style={styles.noticeOptionMeta}>{poll.voters}/{members.length}명 찬성</ThemedText>
                          </View>
                          <Pressable
                            style={({ pressed }) => [
                              styles.noticeVoteButton,
                              poll.voted && styles.noticeVoteButtonSelected,
                              pressed && styles.pressed,
                            ]}
                            onPress={() => voteOnSharedPoll(message.id, poll.id)}>
                            <ThemedText style={[styles.noticeVoteButtonText, poll.voted && styles.noticeVoteButtonTextSelected]}>
                              {poll.voted ? '취소' : '찬성'}
                            </ThemedText>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                    <ThemedText style={styles.noticeHint}>
                      {message.pollCompleted ? '캘박이 완료된 추천입니다.' : '추천된 시간 중 가능한 시간에 투표해주세요.'}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.bubble, message.mine ? styles.myBubble : styles.friendBubble]}>
                    <ThemedText style={[styles.bubbleText, message.mine && styles.myBubbleText]}>
                      {message.text}
                    </ThemedText>
                  </View>
                )}
                {!message.mine && <ThemedText style={styles.messageTime}>{message.time}</ThemedText>}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: safeAreaInsets.bottom + 10 }]}>
        <Pressable style={({ pressed }) => [styles.attachButton, pressed && styles.pressed]} onPress={() => setActionOpen(true)}>
          <ThemedText style={styles.attachButtonText}>+</ThemedText>
        </Pressable>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          onSubmitEditing={sendMessage}
          style={styles.messageInput}
          placeholder="메시지 보내기"
          placeholderTextColor="#94A3B8"
          returnKeyType="send"
        />
        <Pressable style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]} onPress={sendMessage}>
          <ThemedText style={styles.sendButtonText}>전송</ThemedText>
        </Pressable>
      </View>

      <Modal transparent animationType="fade" visible={actionOpen} onRequestClose={() => setActionOpen(false)}>
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActionOpen(false)} />
          <View style={[styles.actionSheet, { paddingBottom: safeAreaInsets.bottom + 18 }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.actionTitle}>추가 기능</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              onPress={() => {
                setActionOpen(false);
                setPollOpen(true);
              }}>
              <View style={styles.actionIcon}>
                <ThemedText style={styles.actionIconText}>시</ThemedText>
              </View>
              <View style={styles.actionTextBlock}>
                <ThemedText style={styles.actionButtonTitle}>모임시간추천</ThemedText>
                <ThemedText style={styles.actionButtonSub}>추천 시간을 확인하고 투표를 만들어요.</ThemedText>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={memberOpen}
        onRequestClose={() => {
          setMemberOpen(false);
          setInviteOpen(false);
          setInviteQuery('');
        }}>
        <View style={styles.modalLayer}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setMemberOpen(false);
              setInviteOpen(false);
              setInviteQuery('');
            }}
          />
          <View style={[styles.memberSheet, { paddingBottom: safeAreaInsets.bottom + 18 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.pollHeader}>
              <View>
                <ThemedText style={styles.pollTitle}>{inviteOpen ? '친구 초대' : '단톡방 멤버'}</ThemedText>
                <ThemedText style={styles.pollSub}>
                  {inviteOpen ? '단톡방에 추가할 친구를 선택해주세요.' : `현재 ${members.length}명이 참여 중이에요.`}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => {
                  if (inviteOpen) {
                    setInviteOpen(false);
                    setInviteQuery('');
                    return;
                  }

                  setMemberOpen(false);
                }}>
                <ThemedText style={styles.closeText}>{inviteOpen ? '이전' : '닫기'}</ThemedText>
              </Pressable>
            </View>

            {inviteOpen ? (
              <>
                <TextInput
                  value={inviteQuery}
                  onChangeText={setInviteQuery}
                  style={styles.inviteSearchInput}
                  placeholder="친구 이름 검색"
                  placeholderTextColor="#94A3B8"
                />

                <View style={styles.inviteList}>
                  {filteredInviteCandidates.length > 0 ? (
                    filteredInviteCandidates.map((candidate) => {
                      const invited = members.includes(candidate);

                      return (
                        <Pressable
                          key={candidate}
                          style={({ pressed }) => [
                            styles.inviteCandidateRow,
                            invited && styles.inviteRowDisabled,
                            pressed && !invited && styles.pressed,
                          ]}
                          disabled={invited}
                          onPress={() => inviteFriend(candidate)}>
                          <View style={styles.memberAvatar}>
                            <ThemedText style={styles.memberAvatarText}>{candidate[0]}</ThemedText>
                          </View>
                          <View style={styles.memberTextBlock}>
                            <ThemedText style={[styles.memberName, invited && styles.inviteNameDisabled]}>{candidate}</ThemedText>
                            <ThemedText style={[styles.memberRole, invited && styles.inviteNameDisabled]}>
                              {invited ? '이미 참여 중' : '초대 가능'}
                            </ThemedText>
                          </View>
                          <View style={[styles.inviteMiniButton, invited && styles.inviteMiniButtonDisabled]}>
                            <ThemedText style={[styles.inviteButtonText, invited && styles.inviteNameDisabled]}>
                              {invited ? '완료' : '초대'}
                            </ThemedText>
                          </View>
                        </Pressable>
                      );
                    })
                  ) : (
                    <ThemedText style={styles.inviteEmptyText}>검색 결과가 없어요.</ThemedText>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.memberList}>
                  {members.map((member) => (
                    <View key={member} style={styles.memberRow}>
                      <View style={styles.memberAvatar}>
                        <ThemedText style={styles.memberAvatarText}>{member[0]}</ThemedText>
                      </View>
                      <View style={styles.memberTextBlock}>
                        <ThemedText style={styles.memberName}>{member}</ThemedText>
                        <ThemedText style={styles.memberRole}>{member === '나' ? '나' : '참여 중'}</ThemedText>
                      </View>
                    </View>
                  ))}
                </View>

                <Pressable style={({ pressed }) => [styles.memberRow, styles.addMemberRow, pressed && styles.pressed]} onPress={() => setInviteOpen(true)}>
                  <View style={styles.addMemberAvatar}>
                    <ThemedText style={styles.addMemberAvatarText}>+</ThemedText>
                  </View>
                  <View style={styles.memberTextBlock}>
                    <ThemedText style={styles.memberName}>친구 추가</ThemedText>
                    <ThemedText style={styles.memberRole}>단톡방에 초대할 친구를 선택해요.</ThemedText>
                  </View>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={pollOpen} onRequestClose={() => setPollOpen(false)}>
        <View style={styles.modalLayer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPollOpen(false)} />
          <View style={[styles.pollSheet, { paddingBottom: safeAreaInsets.bottom + 18 }]}>
            <View style={styles.modalHandle} />
            <View style={styles.pollHeader}>
              <View>
                <ThemedText style={styles.pollTitle}>모임 시간 추천</ThemedText>
                <ThemedText style={styles.pollSub}>추천된 시간 중 하나를 골라 투표할 수 있어요.</ThemedText>
              </View>
              <Pressable onPress={() => setPollOpen(false)}>
                <ThemedText style={styles.closeText}>닫기</ThemedText>
              </Pressable>
            </View>

            <View style={styles.pollList}>
              {polls.map((poll) => (
                <View key={poll.id} style={styles.pollRow}>
                  <View style={styles.pollTextBlock}>
                    <ThemedText style={styles.pollTime}>{poll.time}</ThemedText>
                    <ThemedText style={styles.pollMeta}>{poll.voters}/{members.length}명 찬성</ThemedText>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.voteButton, poll.voted && styles.voteButtonSelected, pressed && styles.pressed]}
                    onPress={() => toggleVote(poll.id)}>
                    <ThemedText style={[styles.voteButtonText, poll.voted && styles.voteButtonTextSelected]}>
                      {poll.voted ? '취소' : '찬성'}
                    </ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>

            <Pressable style={({ pressed }) => [styles.sharePollButton, pressed && styles.pressed]} onPress={sharePollToChat}>
              <ThemedText style={styles.sharePollButtonText}>단톡방에 공유</ThemedText>
            </Pressable>
            <ThemedText style={styles.pollHint}>
              현재는 하드코딩 추천 시간이며, 이후 다른 팀원이 만든 모임시간추천 화면/API 결과를 이 영역에 연결할 예정이에요.
            </ThemedText>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAF0F8' },
  header: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.three,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF3',
  },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  backButtonText: { color: '#111827', fontSize: 36, fontWeight: '800', lineHeight: 38 },
  headerText: { flex: 1, minWidth: 0 },
  roomName: { color: '#111827', fontSize: 17, fontWeight: '900' },
  roomMeta: { color: '#94A3B8', fontSize: 11, fontWeight: '800', marginTop: 2 },
  moreButtonText: { color: '#64748B', fontSize: 24, fontWeight: '900', lineHeight: 24 },
  messagesScroll: { flex: 1, width: '100%' },
  messagesContent: { paddingHorizontal: Spacing.three, paddingTop: 14, gap: 12 },
  datePill: {
    alignSelf: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(100, 116, 139, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  datePillText: { color: '#64748B', fontSize: 11, fontWeight: '900' },
  messageRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  myMessageRow: { justifyContent: 'flex-end' },
  senderAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderAvatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  messageBlock: { maxWidth: '78%', minWidth: 0 },
  myMessageBlock: { alignItems: 'flex-end' },
  senderName: { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 5 },
  myBubbleWrap: { justifyContent: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 10 },
  friendBubble: { borderTopLeftRadius: 6, backgroundColor: '#FFFFFF' },
  myBubble: { borderTopRightRadius: 6, backgroundColor: '#5B7FFF' },
  bubbleText: { color: '#1E1E2E', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  myBubbleText: { color: '#FFFFFF', fontWeight: '700' },
  noticeCard: {
    width: 252,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE4FF',
    padding: 13,
    gap: 10,
  },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  noticeLabel: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    color: '#5B7FFF',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  noticeTitle: { color: '#111827', fontSize: 14, fontWeight: '900' },
  noticeOptionList: { gap: 7 },
  noticeOption: {
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 9,
  },
  noticeOptionTextBlock: { flex: 1, minWidth: 0 },
  noticeOptionTime: { color: '#1E1E2E', fontSize: 12, fontWeight: '900' },
  noticeOptionMeta: { color: '#64748B', fontSize: 11, fontWeight: '800', marginTop: 3 },
  noticeVoteButton: {
    minHeight: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  noticeVoteButtonSelected: { backgroundColor: '#5B7FFF' },
  noticeVoteButtonText: { color: '#5B7FFF', fontSize: 11, fontWeight: '900' },
  noticeVoteButtonTextSelected: { color: '#FFFFFF' },
  noticeHint: { color: '#94A3B8', fontSize: 11, lineHeight: 16 },
  messageTime: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDF3',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButtonText: { color: '#5B7FFF', fontSize: 24, fontWeight: '800', lineHeight: 26 },
  messageInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    color: '#1E1E2E',
    fontSize: 14,
    paddingHorizontal: 14,
  },
  sendButton: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  sendButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  modalLayer: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.35)' },
  actionSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    paddingTop: 10,
    gap: 12,
  },
  actionTitle: { color: '#111827', fontSize: 17, fontWeight: '900' },
  actionButton: {
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  actionTextBlock: { flex: 1, minWidth: 0 },
  actionButtonTitle: { color: '#111827', fontSize: 14, fontWeight: '900' },
  actionButtonSub: { color: '#64748B', fontSize: 12, fontWeight: '700', marginTop: 3 },
  memberSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    paddingTop: 10,
    gap: 14,
    maxHeight: '82%',
  },
  memberList: { gap: 8 },
  memberRow: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EDF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  memberTextBlock: { flex: 1, minWidth: 0 },
  memberName: { color: '#111827', fontSize: 14, fontWeight: '900' },
  memberRole: { color: '#94A3B8', fontSize: 11, fontWeight: '800', marginTop: 2 },
  addMemberRow: { borderStyle: 'dashed', borderColor: '#DDE4FF', backgroundColor: '#FFFFFF' },
  addMemberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberAvatarText: { color: '#5B7FFF', fontSize: 22, fontWeight: '800', lineHeight: 24 },
  inviteSearchInput: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#1E1E2E',
    fontSize: 14,
    paddingHorizontal: 13,
  },
  inviteList: { gap: 7 },
  inviteCandidateRow: {
    minHeight: 56,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DDE4FF',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  inviteRowDisabled: { backgroundColor: '#F8FAFC', borderColor: '#E8EDF3' },
  inviteMiniButton: {
    minWidth: 42,
    minHeight: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DDE4FF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  inviteMiniButtonDisabled: { backgroundColor: '#F8FAFC', borderColor: '#E8EDF3' },
  inviteButtonText: { color: '#5B7FFF', fontSize: 11, fontWeight: '900' },
  inviteNameDisabled: { color: '#94A3B8' },
  inviteEmptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '800', textAlign: 'center', paddingVertical: 18 },
  pollSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    paddingTop: 10,
    gap: 14,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  pollHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  pollTitle: { color: '#111827', fontSize: 17, fontWeight: '900' },
  pollSub: { color: '#64748B', fontSize: 12, lineHeight: 18, marginTop: 3 },
  closeText: { color: '#64748B', fontSize: 12, fontWeight: '900' },
  pollList: { gap: 8 },
  pollRow: {
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  pollTextBlock: { flex: 1, minWidth: 0 },
  pollTime: { color: '#1E1E2E', fontSize: 14, fontWeight: '900' },
  pollMeta: { color: '#94A3B8', fontSize: 12, fontWeight: '800', marginTop: 3 },
  voteButton: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  voteButtonSelected: { backgroundColor: '#5B7FFF' },
  voteButtonText: { color: '#5B7FFF', fontSize: 12, fontWeight: '900' },
  voteButtonTextSelected: { color: '#FFFFFF' },
  sharePollButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#5B7FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharePollButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  pollHint: { color: '#94A3B8', fontSize: 11, lineHeight: 17 },
  pressed: { opacity: 0.72 },
});
