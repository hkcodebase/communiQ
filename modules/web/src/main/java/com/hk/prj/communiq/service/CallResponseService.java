package com.hk.prj.communiq.service;

import com.twilio.twiml.VoiceResponse;
import com.twilio.twiml.voice.Say;
import org.springframework.stereotype.Service;

@Service
public class CallResponseService {
     public String generateCallResponse(){
         VoiceResponse twiml = new VoiceResponse.Builder()
                 .say(new Say.Builder("Hello world!")
                         .voice(Say.Voice.ALICE)
                         .build())
                 .build();
         return twiml.toXml();
     }
}
