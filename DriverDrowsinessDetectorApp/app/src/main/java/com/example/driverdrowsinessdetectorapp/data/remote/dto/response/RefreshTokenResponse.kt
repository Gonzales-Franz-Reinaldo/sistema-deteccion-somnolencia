package com.example.driverdrowsinessdetectorapp.data.remote.dto.response

import com.google.gson.annotations.SerializedName

data class RefreshTokenResponse(
    @SerializedName("access_token")
    val accessToken: String,
    
    @SerializedName("token_type")
    val tokenType: String = "bearer"
)