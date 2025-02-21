package com.jiraClone.jiraclone.services.impl;

import com.jiraClone.jiraclone.Enum.Status;
import com.jiraClone.jiraclone.models.Task;
import com.jiraClone.jiraclone.respository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class KeycloakServiceImpl {

    private final Keycloak keycloak;
    private final TaskRepository taskRepository;
    public List<UserRepresentation> getUsers(){

            RealmResource realmResource = keycloak.realm("delivery-manager");
            UsersResource usersResource = realmResource.users();
            return usersResource.list();
    }

    public void assignTaskToUser(String taskId, String userId) {
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
    }

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
