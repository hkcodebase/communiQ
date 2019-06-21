package com.hk.prj.communiq.controller;

import java.security.Principal;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class IndexController {

	/*@RequestMapping(value={"/","/home"})
	public ModelAndView getIndex(){
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.setViewName("home");
		return modelAndView;
	}*/

	@RequestMapping("/securedPage")
	public String securedPage(Model model, Principal principal) {
		return "securedPage";
	}

	@RequestMapping("/")
	public String index(Model model, Principal principal) {
		return "index";
	}
	
	@RequestMapping(value={"/home"})
	public ModelAndView getIndex(){
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.setViewName("home");
		return modelAndView;
	}
}
