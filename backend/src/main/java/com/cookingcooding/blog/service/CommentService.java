package com.cookingcooding.blog.service;

import com.cookingcooding.auth.entity.User;
import com.cookingcooding.auth.repository.UserRepository;
import com.cookingcooding.blog.dto.CommentRequest;
import com.cookingcooding.blog.dto.CommentResponse;
import com.cookingcooding.blog.entity.Comment;
import com.cookingcooding.blog.entity.Post;
import com.cookingcooding.blog.repository.CommentRepository;
import com.cookingcooding.blog.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private static final String ADMIN_EMAIL = "namubal78@gmail.com";

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId) {
        return commentRepository.findByPostIdAndParentIdIsNullOrderByCreatedAtAsc(postId)
                .stream()
                .map(root -> {
                    CommentResponse resp = new CommentResponse(root);
                    List<CommentResponse> children = commentRepository
                            .findByParentIdOrderByCreatedAtAsc(root.getId())
                            .stream().map(CommentResponse::new).collect(Collectors.toList());
                    resp.setChildren(children);
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse create(Long postId, CommentRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        String content = sanitize(req.getContent());

        Comment.CommentBuilder builder = Comment.builder()
                .post(post)
                .parentId(req.getParentId())
                .content(content);

        String email = currentEmail();
        if (!email.isEmpty()) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
            builder.user(user);
        } else {
            String authorName = req.getAuthorName();
            if (authorName == null || authorName.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "작성자 이름을 입력해주세요.");
            }
            String password = req.getPassword();
            if (password == null || password.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호를 입력해주세요.");
            }
            builder.authorName(sanitize(authorName))
                   .passwordHash(passwordEncoder.encode(password));
        }

        return new CommentResponse(commentRepository.save(builder.build()));
    }

    @Transactional
    public CommentResponse update(Long commentId, CommentRequest req) {
        Comment comment = findById(commentId);
        checkPermission(comment, req.getPassword());
        comment.setContent(sanitize(req.getContent()));
        return new CommentResponse(commentRepository.save(comment));
    }

    @Transactional
    public void delete(Long commentId, String password) {
        Comment comment = findById(commentId);
        checkPermission(comment, password);
        commentRepository.delete(comment);
    }

    private void checkPermission(Comment comment, String password) {
        String email = currentEmail();
        if (ADMIN_EMAIL.equals(email)) return;

        if (comment.getUser() != null) {
            if (!email.equals(comment.getUser().getEmail())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다.");
            }
        } else {
            if (password == null || password.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호를 입력해주세요.");
            }
            if (!passwordEncoder.matches(password, comment.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다.");
            }
        }
    }

    private Comment findById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
    }

    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return "";
        String name = auth.getName();
        return name == null || "anonymousUser".equals(name) ? "" : name;
    }

    // HTML 태그 제거 — React가 text 노드로 렌더링하므로 XSS는 프론트에서도 차단되지만 이중 방어
    private String sanitize(String input) {
        if (input == null) return "";
        return input.replaceAll("<[^>]*>", "").trim();
    }
}
