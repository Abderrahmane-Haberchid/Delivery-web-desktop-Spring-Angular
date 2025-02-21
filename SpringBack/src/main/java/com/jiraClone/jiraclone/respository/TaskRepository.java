package com.jiraClone.jiraclone.respository;

import com.jiraClone.jiraclone.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Integer> {
}
