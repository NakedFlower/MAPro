package com.groom.MAPro.service;

import com.groom.MAPro.entity.PreferenceOption;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.entity.UserPreference;
import com.groom.MAPro.repository.PreferenceOptionRepository;
import com.groom.MAPro.repository.UserPreferenceRepository;
import com.groom.MAPro.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserPreferenceService {
    private final UserRepository userRepository;
    private final PreferenceOptionRepository optionRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    public UserPreferenceService(UserRepository userRepository,
                                 PreferenceOptionRepository optionRepository,
                                 UserPreferenceRepository userPreferenceRepository) {
        this.userRepository = userRepository;
        this.optionRepository = optionRepository;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    @Transactional
    public void saveUserPreferences(Long userId, List<Long> selectedOptionIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID=" + userId));

        // 기존 선택 삭제 후 새로 저장 (중복 방지)
        userPreferenceRepository.deleteAll(userPreferenceRepository.findByUser(user));

        // 선택된 옵션 조회
        List<PreferenceOption> selectedOptions = optionRepository.findAllByIdIn(selectedOptionIds);

        // UserPreference 엔티티 생성 후 저장
        List<UserPreference> newPreferences = selectedOptions.stream()
                .map(option -> {
                    UserPreference up = new UserPreference();
                    up.setUser(user);
                    up.setOption(option);
                    up.setIsSelected(true);
                    return up;
                }).collect(Collectors.toList());

        userPreferenceRepository.saveAll(newPreferences);
    }

    @Transactional
    public Set<Long> getUserSelectedPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID=" + userId));

        return userPreferenceRepository.findByUser(user)
                .stream()
                .filter(UserPreference::getIsSelected)
                .map(up -> up.getOption().getOptionId())
                .collect(Collectors.toSet());
    }

}
