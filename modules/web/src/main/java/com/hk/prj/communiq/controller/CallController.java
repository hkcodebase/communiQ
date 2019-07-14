package com.hk.prj.communiq.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.hk.prj.communiq.base.BaseService;
import com.hk.prj.communiq.constant.ResponseConstant;
import com.hk.prj.communiq.model.CallDto;
import com.hk.prj.communiq.service.CallService;
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

	@RequestMapping("/")
	public String index(Model model) {
		return "redirect:/home";
	}
	
	@RequestMapping(value={"/home"})
	public ModelAndView home(){
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.getModel().put("callInputModel", new CallDto());
		modelAndView.getModel().put("twilio_number", twilio_phone_number);
		List<OutgoingCallerId> contactlist = callService.getAllContacts();
		modelAndView.getModel().put("contactlist", contactlist);
		modelAndView.setViewName("home");
		return modelAndView;
	}
	
	@PostMapping("/makecall")
	public ResponseEntity<Call> makeCall(@RequestBody String toNumber) throws Exception{
		Call call = callService.makeCall(toNumber);

		if(null!=call){
			return new ResponseEntity<>(call, HttpStatus.OK);
		}
		else{
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}		

	@GetMapping("/calls")
	public ModelAndView calls() throws Exception{
		ModelAndView modelAndView = new ModelAndView("allcalls");
		modelAndView.getModel().put("calls", callService.getAllCalls());
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
		str.append("I am calling from CommuniQ");

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
				String.format(ResponseConstant.DEFAULT_RESPONSE)).build());

		builder.gather(new Gather.Builder()
				.numDigits(1)
				.action("/yourInfo")
				.method(HttpMethod.POST)
				.numDigits(2)
				.action("/new-request")
				.method(HttpMethod.POST)
				.numDigits(3)
				.action("/customercare")
				.method(HttpMethod.POST)
				.build());

		return builder.build().toXml();
	}

	@PostMapping(value="/yourInfo",produces="application/xml")
	@ResponseBody
	public String laugh(){ 		
		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder("you are a good man")
						.voice(Say.Voice.ALICE)
						.build())
				.build();
		return twiml.toXml();
	}

	@PostMapping(value="/new-request",produces="application/xml")
	@ResponseBody
	public String sayHello(){ 		
		VoiceResponse twiml = new VoiceResponse.Builder()
				.say(new Say.Builder("please request")
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

	@PostMapping("/addNumberToVerifyList")
	public ResponseEntity<List<OutgoingCallerId>> addNumberToverifyList(@ModelAttribute ("callInputModel") CallDto callInputModel){
		callService.addNumberToverifyList(callInputModel.getToNumber(), callInputModel.getFriendlyName());
		return new ResponseEntity<>(callService.getAllContacts(), HttpStatus.OK);
	}
}


