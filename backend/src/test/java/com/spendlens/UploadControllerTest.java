package com.spendlens;

import com.spendlens.controller.UploadController;
import com.spendlens.dto.UploadStatusDto;
import com.spendlens.service.UploadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UploadController.class)
public class UploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UploadService uploadService;

    @Test
    public void uploadFileReturnsAcceptedStatus() throws Exception {
        UUID uploadId = UUID.randomUUID();
        UploadStatusDto expectedResponse = UploadStatusDto.builder()
                .uploadId(uploadId)
                .fileName("statement.csv")
                .fileSize(100)
                .status("COMPLETED")
                .recordCount(10)
                .createdAt(Instant.now())
                .build();

        when(uploadService.processUpload(any())).thenReturn(expectedResponse);

        MockMultipartFile csvFile = new MockMultipartFile(
                "file",
                "statement.csv",
                MediaType.TEXT_PLAIN_VALUE,
                "Date,Narration,Withdrawal,Deposit,Balance\n01/07/26,Swiggy,100,,1000".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/uploads").file(csvFile))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.uploadId").value(uploadId.toString()))
                .andExpect(jsonPath("$.fileName").value("statement.csv"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.recordCount").value(10));
    }
}
