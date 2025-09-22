package com.groom.MAPro.Service;

import com.groom.MAPro.entity.PreferenceCategory;
import com.groom.MAPro.entity.PreferenceOption;
import com.groom.MAPro.entity.User;
import com.groom.MAPro.entity.UserPreference;
import com.groom.MAPro.repository.PreferenceOptionRepository;
import com.groom.MAPro.repository.UserPreferenceRepository;
import com.groom.MAPro.repository.UserRepository;
import com.groom.MAPro.service.UserPreferenceService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@ImportAutoConfiguration(exclude = {
        com.google.cloud.spring.autoconfigure.secretmanager.GcpSecretManagerAutoConfiguration.class
})
public class UserPreferenceServiceTest {
    @Autowired
    private UserPreferenceService service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PreferenceOptionRepository optionRepository;

    @Autowired
    private UserPreferenceRepository userPreferenceRepository;

    private User testUser;
    private PreferenceOption option1;
    private PreferenceOption option2;

    @BeforeEach
    void setUp() {
        userPreferenceRepository.deleteAll();
        optionRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User("testuser", "password", "홍길동");
        userRepository.save(testUser);

        PreferenceCategory category = new PreferenceCategory();
        category.setCategoryName("테스트 카테고리");

        option1 = new PreferenceOption();
        option1.setOptionName("옵션1");
        option1.setCategory(category);

        option2 = new PreferenceOption();
        option2.setOptionName("옵션2");
        option2.setCategory(category);

        optionRepository.saveAll(List.of(option1, option2));
    }

    @Test
    void 사용자성향저장_성공() {
        List<Long> optionIds = List.of(option1.getOptionId(), option2.getOptionId());

        service.savePreferences(testUser, optionIds);

        List<UserPreference> prefs = userPreferenceRepository.findByUser(testUser);
        assertEquals(2, prefs.size());
        assertTrue(prefs.stream().allMatch(UserPreference::getIsSelected));
    }

    @Test
    void 사용자성향조회_성공() {
        UserPreference pref = new UserPreference();
        pref.setUser(testUser);
        pref.setOption(option1);
        pref.setIsSelected(true);
        userPreferenceRepository.save(pref);

        List<UserPreference> prefs = service.getUserPreferences(testUser);
        assertEquals(1, prefs.size());
        assertEquals(option1.getOptionId(), prefs.get(0).getOption().getOptionId());
    }
}
