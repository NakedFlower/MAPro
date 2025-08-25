package com.groom.MAPro.repository;

import com.groom.MAPro.entity.PreferenceOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreferenceOptionRepository extends JpaRepository<PreferenceOption, Long> {
    List<PreferenceOption> findAllByIdIn(List<Long> ids);
}
