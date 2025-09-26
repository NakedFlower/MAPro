package com.groom.MAPro.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Converter(autoApply = true)
public class LongToLocalDateTimeConverter implements AttributeConverter<LocalDateTime, Long> {
    @Override
    public Long convertToDatabaseColumn(LocalDateTime attribute) {
        return attribute != null ? attribute.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() : null;
    }

    @Override
    public LocalDateTime convertToEntityAttribute(Long dbData) {
        return dbData != null ? Instant.ofEpochMilli(dbData).atZone(ZoneId.systemDefault()).toLocalDateTime() : null;
    }
}
