package com.jiraClone.jiraclone.services.impl;

import com.jiraClone.jiraclone.Enum.Status;
import com.jiraClone.jiraclone.dto.TaskDto;
import com.jiraClone.jiraclone.mapper.Mapper;
import com.jiraClone.jiraclone.models.Task;
import com.jiraClone.jiraclone.respository.TaskRepository;
import com.jiraClone.jiraclone.services.TaskService;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final SimpMessagingTemplate template;


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

        try {
            Task task = taskRepository.findById(id).get();
            task.setStatus(Status.COMPLETED);
            task.setUpdated_at(new Date());
            taskRepository.save(task);

            RealmResource realmResource = keycloak.realm("delivery-manager");
            UsersResource usersResource = realmResource.users();
            UserRepresentation user = usersResource.get(task.getEmployeId()).toRepresentation();

            try {
                Map<String, List<String>> attributes = user.getAttributes();

                List<String> tasksId = attributes.getOrDefault("taskid", new ArrayList<>());

                tasksId.remove(String.valueOf(task.getId()));
                attributes.put("taskid", tasksId);
                user.setAttributes(attributes);

                usersResource.get(task.getEmployeId()).update(user);

                template.convertAndSend("/topic/assigned-task", task);
            } catch (NotFoundException e) {
                throw new NotFoundException("User doesn't have any task with this id: "+task.getId() + e.getMessage());
            }

            return task;
        } catch (NotFoundException e) {
            throw new NotFoundException("No Realm or User has been found "+e.getMessage());
        }
    }

    @Override
    public Task markAsUnCompleted(int id) {
        try {
            Task task = taskRepository.findById(id).get();
            task.setStatus(Status.ASSIGNED);
            task.setUpdated_at(null);
            taskRepository.save(task);

            RealmResource realmResource = keycloak.realm("delivery-manager");
            UsersResource usersResource = realmResource.users();
            UserRepresentation user = usersResource.get(task.getEmployeId()).toRepresentation();

            Map<String, List<String>> attributes = user.getAttributes();

            if (attributes == null){
                attributes = new HashMap<>();
            }

            try {
                List<String> tasksId = attributes.getOrDefault("taskid", new ArrayList<>());

                // Append the new task ID if it doesn't already exist
                tasksId.add(String.valueOf(task.getId()));

                // Update the attributes with the new task IDs
                attributes.put("taskid", tasksId);
                user.setAttributes(attributes);

                // Update the user in Keycloak
                usersResource.get(task.getEmployeId()).update(user);

                template.convertAndSend("/topic/assigned-task", task);

            } catch (Exception e) {
                throw new RuntimeException("Error occured while adding task id to user "+e.getMessage());
            }

            return task;
        } catch (Exception e) {
            throw new RuntimeException("No task or Realm has been found" + e.getMessage());
        }
    }
}
