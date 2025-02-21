package com.jiraClone.jiraclone.services.impl;

import com.jiraClone.jiraclone.Enum.Status;
import com.jiraClone.jiraclone.dto.TaskDto;
import com.jiraClone.jiraclone.mapper.Mapper;
import com.jiraClone.jiraclone.models.Task;
import com.jiraClone.jiraclone.respository.TaskRepository;
import com.jiraClone.jiraclone.services.TaskService;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final Mapper mapper;
    private final Keycloak keycloak;


    @Override
    public Task save(TaskDto taskDto) {
        Task task = mapper.taskDtotoModel(taskDto);
        return taskRepository.save(task);
    }

    @Override
    public List<Task> getTasks() {
        return taskRepository.findAll();
    }

    @Override
    public boolean delete(int id) {
        taskRepository.deleteById(id);
        Optional<Task> task = taskRepository.findById(id);
        if (task.isEmpty())
            return true;
        else
            return false;
    }

    @Override
    public Task markAsCompleted(int id) {

        Task task = taskRepository.findById(id).get();
        task.setStatus(Status.COMPLETED);
        taskRepository.save(task);

        RealmResource realmResource = keycloak.realm("delivery-manager");
        UsersResource usersResource = realmResource.users();
        UserRepresentation user = usersResource.get(task.getEmployeId()).toRepresentation();

        user.getAttributes().remove("taskid", List.of(task.getId()));

        usersResource.get(task.getEmployeId()).update(user);

        return task;
    }

    @Override
    public Task markAsUnCompleted(int id) {
        Task task = taskRepository.findById(id).get();
        task.setStatus(Status.ASSIGNED);
        taskRepository.save(task);

        RealmResource realmResource = keycloak.realm("delivery-manager");
        UsersResource usersResource = realmResource.users();
        UserRepresentation user = usersResource.get(task.getEmployeId()).toRepresentation();

        Map<String, List<String>> attributes = user.getAttributes();

        if (attributes == null){
            attributes = new HashMap<>();
        }

        List<String> tasksId = attributes.getOrDefault("taskid", new ArrayList<>());

        // Append the new task ID if it doesn't already exist
        tasksId.add(String.valueOf(task.getId()));

        // Update the attributes with the new task IDs
        attributes.put("taskid", tasksId);
        user.setAttributes(attributes);

        // Update the user in Keycloak
        usersResource.get(task.getEmployeId()).update(user);

        return task;
    }
}
