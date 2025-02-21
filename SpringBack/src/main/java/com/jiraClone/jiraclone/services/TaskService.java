package com.jiraClone.jiraclone.services;

import com.jiraClone.jiraclone.dto.TaskDto;
import com.jiraClone.jiraclone.models.Task;

import java.util.List;

public interface TaskService {
    Task save(TaskDto taskDto);
    List<Task> getTasks();

    boolean delete(int id);

    Task markAsCompleted(int id);

    Task markAsUnCompleted(int id);
}
