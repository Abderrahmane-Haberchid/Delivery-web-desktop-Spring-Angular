package com.jiraClone.jiraclone.dto;

import com.jiraClone.jiraclone.Enum.Status;
import lombok.Builder;

import java.util.Date;

@Builder
public record TaskDto(
        String title,
        String description,
        Status status,
        Date created_at,
        Date updated_at
) {
}
