package com.jiraClone.jiraclone.dto;

import com.jiraClone.jiraclone.Enum.Status;
import lombok.Builder;

import java.util.Date;

@Builder
public record TaskDto(
        String adresse,
        double price,
        String description,
        Status status,
        Date created_at,
        Date updated_at
) {
}
