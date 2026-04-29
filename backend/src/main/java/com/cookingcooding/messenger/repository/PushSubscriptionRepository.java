package com.cookingcooding.messenger.repository;

import com.cookingcooding.messenger.entity.UserPushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<UserPushSubscription, Long> {
    Optional<UserPushSubscription> findByEndpoint(String endpoint);
    List<UserPushSubscription> findByUserEmailNot(String email);
}
