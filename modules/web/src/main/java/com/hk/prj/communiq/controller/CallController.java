package com.hk.prj.communiq.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.hk.prj.communiq.base.BaseService;
import com.hk.prj.communiq.model.CallInputModel;
import com.hk.prj.communiq.service.CallService;
import com.twilio.base.ResourceSet;
import com.twilio.http.HttpMethod;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.OutgoingCallerId;
import com.twilio.twiml.VoiceResponse;
import com.twilio.twiml.voice.Dial;
import com.twilio.twiml.voice.Gather;
import com.twilio.twiml.voice.Number;
import com.twilio.twiml.voice.Redirect;
import com.twilio.twiml.voice.Say;

@Controller
public class CallController extends BaseService{
	
	@Autowired
	CallService callService;

	@RequestMapping("/showmakecall")
	public ModelAndView showMakeCallPage(){
		ModelAndView modelAndView = new ModelAndView();		
		modelAndView.getModel().put("callInputModel", new CallInputModel());
		modelAndView.setViewName("makecallpage");
		return modelAndView;
	}

	@RequestMapping("/makecall")
	public ModelAndView makeCall(@ModelAttribute ("callInputModel") CallInputModel callInputModel, BindingResult result){
		ModelAndView modelAndView = new ModelAndView();
		Call call;
		try {
			call = callService.makeCall(callInputModel.getToNumber());

			if(null!=call){
				modelAndView.getModel().put("call", call);
			}
			else{

			}
			modelAndView.setViewName("call");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return modelAndView;
	}

	@RequestMapping("/showcallcentre")
	public ModelAndView showCallCenterPage(){
		ModelAndView modelAndView = new ModelAndView();		
		modelAndView.setViewName("callcentrepage");
		return modelAndView;
	}

	@PostMapping(value="/handlecall",produces="application/xml")
	@ResponseBody
	public String handleCallPage(){ 
		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder("Hello world!")
						.voice(Say.Voice.ALICE)
						.build())
				.build();
		return twiml.toXml();
	}

	@PostMapping(value="/generateResponse",produces="application/xml")
	@ResponseBody
	public String generateResponse(){ 
		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder("Hello user I am calling from Demo App!")
						.voice(Say.Voice.ALICE)
						.build())
				.build();
		return twiml.toXml();
	}

	@PostMapping(value="/generateResponseByNumber",produces="application/xml")
	@ResponseBody
	public String generateResponse(String toNumber){ 
		OutgoingCallerId outgoingCallerId = callService.getOutgoingCallerIdByNumber(toNumber);
		StringBuilder str = new StringBuilder();
		str.append("Hello");
		str.append(outgoingCallerId.getFriendlyName());
		str.append("I am calling from Demo App!");

		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder(str.toString())
						.voice(Say.Voice.ALICE)
						.build())
				.build();
		return twiml.toXml();
	}

	@PostMapping(value="/handlecallredirect",produces="application/xml")
	@ResponseBody
	public String handleCallAndRedirectPage(){ 
		VoiceResponse.Builder builder = new VoiceResponse.Builder();
		builder.say(new Say.Builder(
				String.format("Thank you for calling to our demo app, please press 1 for a laugh. Press 2 for hello, Press 3 to redirect to redirect customer care ")).build());

		builder.gather(new Gather.Builder()
				.numDigits(1)
				.action("/laugh")
				.method(HttpMethod.POST)
				.numDigits(2)
				.action("/sayhello")
				.method(HttpMethod.POST)
				.numDigits(3)
				.action("/customercare")
				.method(HttpMethod.POST)
				.build());

		/*builder.gather(new Gather.Builder()
				.numDigits(2)
				.action("/sayhello")
				.method(HttpMethod.POST)
				.build());

		builder.gather(new Gather.Builder()
				.numDigits(3)
				.action("/customercare")
				.method(HttpMethod.POST)
				.build());*/

		return builder.build().toXml();
	}

	@PostMapping(value="/laugh",produces="application/xml")
	@ResponseBody
	public String laugh(){ 		
		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder("ha ha ha ha ha ha ha!")
						.voice(Say.Voice.ALICE)
						.build())
				.build();
		return twiml.toXml();
	}

	@PostMapping(value="/sayhello",produces="application/xml")
	@ResponseBody
	public String sayHello(){ 		
		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder("hello hello hello")
						.voice(Say.Voice.ALICE)
						.build())
				.build();
		return twiml.toXml();
	}

	@PostMapping(value="/customercare",produces="application/xml")
	@ResponseBody
	public String customerCare(){
		VoiceResponse.Builder builder = new VoiceResponse.Builder();
		String sayMessage = String.format("you are redirected to customer care.. please wait");
		builder.say(new Say.Builder(sayMessage).build());

		Number number = new Number.Builder(customer_care_number).build();
		Dial dial = new Dial.Builder().number(number).build();
		Redirect redirect = new Redirect.Builder(redirect_url)
				.build();
		builder.dial(dial)
		.redirect(redirect).build();

		return builder.build().toXml();
	}

	@PostMapping(value="/redirectResponse",produces="application/xml")
	@ResponseBody
	public String sayRedirectResponse(){ 		
		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder("Hello from customer care, Thanks for calling")
						.voice(Say.Voice.ALICE)
						.build())
				.build();
		return twiml.toXml();
	}



	@RequestMapping("/showcallerid")
	public ModelAndView showCallerIdPage(){
		ModelAndView modelAndView = new ModelAndView();	

		List<OutgoingCallerId> contactlist = callService.getAllContacts();
		modelAndView.getModel().put("contactlist", contactlist);
		modelAndView.getModel().put("callInputModel", new CallInputModel());
		modelAndView.setViewName("calleridpage");
		return modelAndView;
	}

	@RequestMapping("/showcalldivert")
	public ModelAndView showCallerDivertPage(){
		ModelAndView modelAndView = new ModelAndView();		
		modelAndView.setViewName("calldivert");
		return modelAndView;
	}

	@RequestMapping("/calls")
	public ModelAndView showAllCallspage(){
		ModelAndView modelAndView = new ModelAndView();
		ResourceSet<Call> callList = callService.getAllCalls();
		List<Call> calls = new ArrayList<>();		
		callList.forEach(c->calls.add(c));
		modelAndView.getModel().put("calls", calls);
		modelAndView.setViewName("allcalls");
		return modelAndView;
	}

	@PostMapping("/addNumberToVerifyList")
	public ModelAndView addNumberToverifyList(@ModelAttribute ("callInputModel") CallInputModel callInputModel, BindingResult result){
		ModelAndView modelAndView = new ModelAndView();		
		String response = callService.addNumberToverifyList(callInputModel.getToNumber(), callInputModel.getFriendlyName());
		modelAndView.getModel().put("response", response);
		modelAndView.setViewName("calleridpage");
		return modelAndView;
	}
}


