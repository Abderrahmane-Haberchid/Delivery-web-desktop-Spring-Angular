package com.jiraClone.jiraclone;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ControllerResponse {
    private String status;
    private String msg;
}
