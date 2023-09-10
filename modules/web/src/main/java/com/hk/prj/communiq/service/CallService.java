package com.hk.prj.communiq.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.base.ResourceSet;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.OutgoingCallerId;
import com.twilio.rest.api.v2010.account.OutgoingCallerIdReader;
import com.twilio.rest.api.v2010.account.ValidationRequest;
import com.twilio.type.PhoneNumber;

@Service
public class CallService extends TwilioService {

	public Call makeCall(String toNumber) throws Exception{
		Call call = null;
		try{
			initializeTwiliorestClient();

			if(null==toNumber){
				throw new Exception("No number to call");
			}
			call = Call.creator(new PhoneNumber(toNumber), new PhoneNumber(twilio_phone_number),
					new URI(response_url)).create();

		}
		catch(URISyntaxException e){
			e.printStackTrace();
		}
		return call;

	}

	public ResourceSet<Call> getAllCalls() {
		initializeTwiliorestClient();
		ResourceSet<Call> calls = Call.reader().read();
		return calls;
	}

	public OutgoingCallerId getOutgoingCallerId(String id) {
		initializeTwiliorestClient();
		OutgoingCallerId outgoingCallerId = OutgoingCallerId.fetcher(id)
				.fetch();
		return outgoingCallerId;
	}

	public OutgoingCallerId getOutgoingCallerIdByNumber(String toNumber) {
		initializeTwiliorestClient();
		PhoneNumber  phoneNumber = new PhoneNumber(toNumber);
		OutgoingCallerIdReader outgoingCallerIdReader = OutgoingCallerId.reader().setPhoneNumber(phoneNumber);
		OutgoingCallerId outgoingCallerId = outgoingCallerIdReader.read().iterator().next();
		return outgoingCallerId;
	}

	public List<OutgoingCallerId> getAllContacts() {
		initializeTwiliorestClient();
		ResourceSet<OutgoingCallerId> resourceSet = OutgoingCallerId.reader().read();
		List<OutgoingCallerId> list = new ArrayList<>();
		resourceSet.forEach(t-> list.add(t));
		return list;
	}

	private void initializeTwiliorestClient() {
		Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
	}

	public String addNumberToverifyList(String toNumber, String friendlyName) {
		initializeTwiliorestClient();
		ValidationRequest validationRequest = ValidationRequest.creator(
				new com.twilio.type.PhoneNumber(toNumber))
				.setFriendlyName(friendlyName)
				.create();
		if(null!=validationRequest){
			return validationRequest.getFriendlyName();
		}
		return "Error";
	}

}
