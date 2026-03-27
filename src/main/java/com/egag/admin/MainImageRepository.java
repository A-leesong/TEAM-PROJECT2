package com.egag.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MainImageRepository extends JpaRepository<MainImage, Long> {
    Optional<MainImage> findBySlotNumber(Integer slotNumber);
}
