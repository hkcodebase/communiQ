package com.hk.prj.communiq.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.twilio.twiml.VoiceResponse;
import com.twilio.twiml.voice.Say;

@RestController
public class HelloController {

	@GetMapping("/hello")
	public String helloWeb() {
		return "Hello World";
	}

	@PostMapping("/")
	public String processResponse() {
		Say say  = new Say.Builder("Hello from your pals at Twilio! Have fun.").build();
		VoiceResponse voiceResponse = new VoiceResponse.Builder()
				.say(say)
				.build();
		return voiceResponse.toXml();
	}
}
