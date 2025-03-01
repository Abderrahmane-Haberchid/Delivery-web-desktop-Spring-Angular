package com.jiraClone.jiraclone.mapper;

import com.jiraClone.jiraclone.dto.TaskDto;
import com.jiraClone.jiraclone.models.Task;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class Mapper {
    public Task taskDtotoModel(TaskDto taskDto){
        return Task.builder()
                .adresse(taskDto.adresse())
                .description(taskDto.description())
                .price(taskDto.price())
                .status(taskDto.status())
                .created_at(new Date())
                .updated_at(taskDto.updated_at())
                .build();
    }

    public TaskDto taskToDto(Task task){
        return TaskDto.builder()
                .adresse(task.getAdresse())
                .price(task.getPrice())
                .description(task.getDescription())
                .status(task.getStatus())
                .created_at(task.getCreated_at())
                .updated_at(task.getUpdated_at())
                .build();
    }
}
