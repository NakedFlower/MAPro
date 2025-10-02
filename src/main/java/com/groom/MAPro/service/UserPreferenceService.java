package com.groom.MAPro.service;

import com.groom.MAPro.entity.PreferenceOption;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.entity.UserPreference;
import com.groom.MAPro.repository.jpa.PreferenceOptionRepository;
import com.groom.MAPro.repository.jpa.UserPreferenceRepository;
import com.groom.MAPro.util.ActivityLogger;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserPreferenceService {
    private final UserPreferenceRepository userPreferenceRepository;
    private final PreferenceOptionRepository optionRepository;

    public UserPreferenceService(UserPreferenceRepository userPreferenceRepository,
                                 PreferenceOptionRepository optionRepository) {
        this.userPreferenceRepository = userPreferenceRepository;
        this.optionRepository = optionRepository;
    }

    // 사용자 성향 저장
    @Transactional
    public void savePreferences(User user, List<Long> optionIds) {
        // 기존 성향 초기화 (옵션 삭제 또는 선택 false 처리 가능)
        List<UserPreference> existingPrefs = userPreferenceRepository.findByUser(user);
        existingPrefs.forEach(pref -> pref.setIsSelected(false));
        userPreferenceRepository.saveAll(existingPrefs);

        // 새 성향 저장
        for (Long optionId : optionIds) {
            PreferenceOption option = optionRepository.findById(optionId)
                    .orElseThrow(() -> new RuntimeException("Option not found: " + optionId));

            UserPreference userPref = userPreferenceRepository.findByUserAndOption(user, option)
                    .orElse(new UserPreference());

            userPref.setUser(user);
            userPref.setOption(option);
            userPref.setIsSelected(true);

            userPreferenceRepository.save(userPref);
        }
    }

    // 사용자 성향 조회
    public List<UserPreference> getUserPreferences(User user) {
        return userPreferenceRepository.findByUser(user);
    }
}
