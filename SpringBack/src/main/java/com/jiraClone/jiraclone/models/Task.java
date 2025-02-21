package com.jiraClone.jiraclone.models;
import com.jiraClone.jiraclone.Enum.Status;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter @Setter
@Builder
@AllArgsConstructor @NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String title;
    private String description;
    @Enumerated(value = EnumType.STRING)
    private Status status;
    private Date created_at;
    private Date updated_at;
    private String employeId;
}
