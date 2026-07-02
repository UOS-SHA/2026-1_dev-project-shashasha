package com.shashasha.crew.controller;

import com.shashasha.crew.dto.ArchiveCreateRequest;
import com.shashasha.crew.dto.ArchiveResponse;
import com.shashasha.crew.security.JwtAuthFilter;
import com.shashasha.crew.service.ArchiveService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 활동 기록 API 입구 (/archives/**).
 * JwtAuthFilter 로 보호되며, 토큰 주인의 기록만 다룬다.
 */
@RestController
@RequestMapping("/archives")
public class ArchiveController {

    private final ArchiveService archiveService;

    public ArchiveController(ArchiveService archiveService) {
        this.archiveService = archiveService;
    }

    /** GET /archives → 내 기록 전체 */
    @GetMapping
    public List<ArchiveResponse> getMyArchives(HttpServletRequest request) {
        return archiveService.findMine(userId(request));
    }

    /** GET /archives/{id} → 기록 단건 */
    @GetMapping("/{id}")
    public ArchiveResponse getArchive(HttpServletRequest request, @PathVariable Long id) {
        return archiveService.findOne(userId(request), id);
    }

    /** POST /archives → 기록 생성 (201) */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ArchiveResponse createArchive(HttpServletRequest request,
                                         @Valid @RequestBody ArchiveCreateRequest body) {
        return archiveService.create(userId(request), body);
    }

    /** PUT /archives/{id} → 기록 수정 */
    @PutMapping("/{id}")
    public ArchiveResponse updateArchive(HttpServletRequest request,
                                         @PathVariable Long id,
                                         @Valid @RequestBody ArchiveCreateRequest body) {
        return archiveService.update(userId(request), id, body);
    }

    /** DELETE /archives/{id} → 기록 삭제 (204) */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArchive(HttpServletRequest request, @PathVariable Long id) {
        archiveService.delete(userId(request), id);
    }

    private Long userId(HttpServletRequest request) {
        return (Long) request.getAttribute(JwtAuthFilter.USER_ID_ATTRIBUTE);
    }
}
