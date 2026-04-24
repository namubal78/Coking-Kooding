package com.cookingcooding.blog.service;

import com.cookingcooding.auth.entity.User;
import com.cookingcooding.auth.repository.UserRepository;
import com.cookingcooding.blog.dto.PostRequest;
import com.cookingcooding.blog.dto.PostResponse;
import com.cookingcooding.blog.entity.Post;
import com.cookingcooding.blog.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final String ADMIN_EMAIL = "namubal78@gmail.com";
    private static final String DRAFT_CATEGORY = "초안";

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<PostResponse> getAll() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(p -> !DRAFT_CATEGORY.equals(p.getCategory()) || isAdmin())
                .map(PostResponse::new)
                .toList();
    }

    public List<PostResponse> getByCategory(String category) {
        if (DRAFT_CATEGORY.equals(category) && !isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");
        }
        return postRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream().map(PostResponse::new).toList();
    }

    public PostResponse getOne(Long id) {
        Post post = findById(id);
        if (DRAFT_CATEGORY.equals(post.getCategory()) && !isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");
        }
        return new PostResponse(post);
    }

    public PostResponse create(PostRequest req) {
        User author = getCurrentUser();
        Post post = Post.builder()
                .title(req.getTitle())
                .category(req.getCategory())
                .content(req.getContent())
                .excerpt(req.getExcerpt())
                .tags(req.getTags() != null ? String.join(",", req.getTags()) : null)
                .author(author)
                .build();
        return new PostResponse(postRepository.save(post));
    }

    public PostResponse update(Long id, PostRequest req) {
        Post post = findById(id);
        checkEditPermission(post);
        post.setTitle(req.getTitle());
        post.setCategory(req.getCategory());
        post.setContent(req.getContent());
        post.setExcerpt(req.getExcerpt());
        post.setTags(req.getTags() != null ? String.join(",", req.getTags()) : null);
        return new PostResponse(postRepository.save(post));
    }

    public void delete(Long id) {
        Post post = findById(id);
        checkEditPermission(post);
        postRepository.delete(post);
    }

    private void checkEditPermission(Post post) {
        String email = currentEmail();
        boolean isAdmin = ADMIN_EMAIL.equals(email);
        boolean isAuthor = post.getAuthor() != null && email.equals(post.getAuthor().getEmail());
        if (!isAdmin && !isAuthor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "수정/삭제 권한이 없습니다.");
        }
    }

    private boolean isAdmin() {
        return ADMIN_EMAIL.equals(currentEmail());
    }

    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return "";
        String name = auth.getName();
        return name == null || "anonymousUser".equals(name) ? "" : name;
    }

    private Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
    }

    private User getCurrentUser() {
        String email = currentEmail();
        if (email.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }
}
