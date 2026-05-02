package com.cookingcooding.blog.dto;

import com.cookingcooding.blog.entity.Comment;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class CommentResponse {

    private final Long id;
    private final Long postId;
    private final Long parentId;
    private final String content;
    private final String authorName;
    private final String authorEmail;
    private final boolean anonymous;
    private final LocalDateTime createdAt;
    private List<CommentResponse> children;

    public CommentResponse(Comment c) {
        this.id = c.getId();
        this.postId = c.getPost().getId();
        this.parentId = c.getParentId();
        this.content = c.getContent();
        this.anonymous = c.getUser() == null;
        this.createdAt = c.getCreatedAt();
        if (c.getUser() != null) {
            this.authorEmail = c.getUser().getEmail();
            this.authorName = c.getUser().getEmail();
        } else {
            this.authorEmail = null;
            this.authorName = c.getAuthorName();
        }
    }

    public void setChildren(List<CommentResponse> children) {
        this.children = children;
    }
}
