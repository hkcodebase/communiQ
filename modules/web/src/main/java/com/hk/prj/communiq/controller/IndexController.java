package com.hk.prj.communiq.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.hk.prj.communiq.base.BaseService;
import com.hk.prj.communiq.model.CallInputModel;
import com.hk.prj.communiq.service.CallService;
import com.twilio.rest.api.v2010.account.OutgoingCallerId;

@Controller
public class IndexController extends BaseService {

	@Autowired
	CallService callService;
	
	
	@RequestMapping("/")
	public String index(Model model, Principal principal) {
		return "index";
	}
	
	@RequestMapping(value={"/home"})
	public ModelAndView getIndex(){
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.getModel().put("callInputModel", new CallInputModel());
		modelAndView.getModel().put("twilio_number", twilio_phone_number);
		List<OutgoingCallerId> contactlist = callService.getAllContacts();
		modelAndView.getModel().put("contactlist", contactlist);
		modelAndView.setViewName("home");
		return modelAndView;
	}
}
