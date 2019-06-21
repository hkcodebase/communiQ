package com.hk.prj.communiq.base;


import org.springframework.beans.factory.annotation.Value;

/**
 * base class to have properties which will be used by all subclasses 
 * 
 * @author hemant.kumar
 *
 */

public abstract class BaseService {

	@Value("${account_sid}")
	protected String ACCOUNT_SID;
	
	@Value("${auth_token}")
	protected String AUTH_TOKEN;
	
	@Value("${from_number}")	
	protected String From_Number;
	
	@Value("${response_url}")	
	protected String response_url;

	@Value("${redirect_url}")	
	protected String redirect_url;

	@Value("${customer_care_number}")	
	protected String customer_care_number;


	
}
