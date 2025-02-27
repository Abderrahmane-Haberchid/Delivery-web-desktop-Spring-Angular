package com.jiraClone.jiraclone.services.impl;

import com.jiraClone.jiraclone.Enum.Status;
import com.jiraClone.jiraclone.models.Task;
import com.jiraClone.jiraclone.respository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class KeycloakServiceImpl {

    private final Keycloak keycloak;
    private final TaskRepository taskRepository;
    //private final SimpMessagingTemplate template;
    public List<UserRepresentation> getUsers(){

            RealmResource realmResource = keycloak.realm("delivery-manager");
            UsersResource usersResource = realmResource.users();
            return usersResource.list();
    }

    public void assignTaskToUser(String taskId, String userId) {
        try {
            // Get the Keycloak realm and user resources
            RealmResource realmResource = keycloak.realm("delivery-manager");
            UsersResource usersResource = realmResource.users();
            UserRepresentation user = usersResource.get(userId).toRepresentation();

            // Get the existing attributes or initialize a new map if none exist
            Map<String, List<String>> attributes = user.getAttributes();
            if (attributes == null) {
                attributes = new HashMap<>();
            }

            // Get the existing task IDs or initialize a new list if none exist
            List<String> taskIds = attributes.getOrDefault("taskid", new ArrayList<>());

            // Append the new task ID if it doesn't already exist
            if (!taskIds.contains(taskId)) {
                taskIds.add(taskId);
            }
            else throw new RuntimeException("Task already assigned to this delivery guy!");

            // Update the attributes with the new task IDs
            attributes.put("taskid", taskIds);
            user.setAttributes(attributes);

            // Update the user in Keycloak
            usersResource.get(userId).update(user);

            // Update the task status and assignee in the database
            Task task = taskRepository.findById(Integer.parseInt(taskId))
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            task.setStatus(Status.ASSIGNED);
            task.setEmployeId(userId);
            taskRepository.save(task);

            //template.convertAndSend("/topic/assigned-task", task);

        } catch (RuntimeException e) {
            throw new RuntimeException("An error has occured while assigning task to delivery guy"+e.getMessage());
        }
    }
    @Transactional
    public void unassignTask(String taskId, String userId) {
        // Get the Keycloak realm and user resources
        RealmResource realmResource = keycloak.realm("delivery-manager");
        UsersResource usersResource = realmResource.users();
        UserRepresentation user = usersResource.get(userId).toRepresentation();

        // Get the existing attributes or initialize a new map if none exist
        Map<String, List<String>> attributes = user.getAttributes();
        if (attributes == null) {
            attributes = new HashMap<>();
        }

        // Get the existing task IDs or initialize a new list if none exist
        List<String> taskIds = attributes.getOrDefault("taskid", new ArrayList<>());

        taskIds.remove(taskId);

        // Update the attributes with the new task IDs
        attributes.put("taskid", taskIds);
        user.setAttributes(attributes);

        // Update the user in Keycloak
        usersResource.get(userId).update(user);

        // Update the task status and assignee in the database
        Task task = taskRepository.findById(Integer.parseInt(taskId))
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(Status.UNASSIGNED);
        task.setEmployeId(null);
        taskRepository.save(task);
    }

}
