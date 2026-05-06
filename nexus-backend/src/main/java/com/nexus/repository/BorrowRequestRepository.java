package com.nexus.repository;

import com.nexus.model.BorrowRequest;
import com.nexus.model.RequestStatus;
import com.nexus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    List<BorrowRequest> findByUser(User user);
    List<BorrowRequest> findByStatus(RequestStatus status);
}
