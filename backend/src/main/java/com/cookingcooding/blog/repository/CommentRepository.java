package com.cookingcooding.blog.repository;

import com.cookingcooding.blog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdAndParentIdIsNullOrderByCreatedAtAsc(Long postId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
}
