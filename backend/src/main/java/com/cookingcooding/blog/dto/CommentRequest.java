package com.cookingcooding.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CommentRequest {

    @NotBlank
    @Size(max = 200, message = "댓글은 200자 이내로 작성해주세요.")
    private String content;

    @Size(max = 50)
    private String authorName;

    private String password;

    private Long parentId;
}
