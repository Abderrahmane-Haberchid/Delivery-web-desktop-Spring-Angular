package com.jiraClone.jiraclone.web;

import com.jiraClone.jiraclone.Enum.Status;
import com.jiraClone.jiraclone.dto.TaskDto;
import com.jiraClone.jiraclone.models.Task;
import com.jiraClone.jiraclone.services.TaskService;
import com.jiraClone.jiraclone.services.impl.KeycloakServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final KeycloakServiceImpl keycloakService;

    @PostMapping("/save")
    private ResponseEntity<?> saveTask(@RequestBody TaskDto taskDto){
        var task = taskService.save(taskDto);
        if (task == null)
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        else
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }

    @GetMapping("/all")
    private ResponseEntity<List<Task>> getAllTasks(){
        return new ResponseEntity<>(taskService.getTasks(), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Boolean> deleteTask(@PathVariable int id){
        boolean resposne = taskService.delete(id);
        if (resposne)
            return new ResponseEntity<>(HttpStatus.OK);
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    @PutMapping("/assign/{taskId}/{userId}")
    public ResponseEntity<String> assignTaskToEmp(@PathVariable String taskId, @PathVariable String userId){
        keycloakService.assignTaskToUser(taskId, userId);
        return ResponseEntity.ok("Task Assigned");
    }
    @PutMapping("/unassign/{taskId}/{userId}")
    public ResponseEntity<String> unassignTask(@PathVariable String taskId, @PathVariable String userId){
        keycloakService.unassignTask(taskId, userId);
        return ResponseEntity.ok("Task Unassigned");
    }

    @PutMapping("/markAsCompleted/{taskId}")
    public ResponseEntity<Task> markAsCompleted(@PathVariable String taskId){
        Task task = taskService.markAsCompleted(Integer.parseInt(taskId));
        if (task.getStatus() == Status.COMPLETED)
            return ResponseEntity.ok(task);
        else
            return new ResponseEntity<>(task, HttpStatus.BAD_REQUEST);

    }

    @PutMapping("/markAsUnCompleted/{taskId}")
    public ResponseEntity<Task> markAsUnCompleted(@PathVariable String taskId){
        Task task = taskService.markAsUnCompleted(Integer.parseInt(taskId));
        if (task.getStatus() == Status.ASSIGNED)
            return ResponseEntity.ok(task);
        else
            return new ResponseEntity<>(task, HttpStatus.BAD_REQUEST);

    }
}
