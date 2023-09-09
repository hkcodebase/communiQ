package com.hk.prj.communiq.base;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * base class to have properties which will be used by all subclasses 
 * 
 * @author hemant.kumar
 *
 */

@Service
public class TwilioService {

	@Value("${account_sid}")
	public String ACCOUNT_SID;
	
	@Value("${auth_token}")
	public String AUTH_TOKEN;
	
	@Value("${twilio_phone_number}")	
	public String twilio_phone_number;
	
	@Value("${response_url}")	
	public String response_url;

	@Value("${redirect_url}")	
	public String redirect_url;

	@Value("${customer_care_number}")	
	public String customer_care_number;


	public String getTwilioPhoneNumber() {
		return twilio_phone_number;
	}

	public String getCustomerCareNumber() {
		return customer_care_number;
	}

	public String getRedirectUrl() {
		return redirect_url;
	}
}
