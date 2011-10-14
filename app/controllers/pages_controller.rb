class PagesController < ApplicationController
  
  before_filter :get_the_time
  
  def home
    @title = "Home"
    @elements =[]#User.first.elements
    @e = Element.find(193)#.eager_load_belief_states
    logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    logger.debug(">>>   #in home of PagesController"+
                 "      @e = #{@e} ")
    #logger.debug(">>> @e = #{@e[0].belief_states} #in home of PagesController\n\n")
    Element.refresh_belief_states(@e, 2)
    logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  end

  def help
    @title = "Help"
  end

  def about
    @title = "About"
  end

  def feedback
    @title = "Feedback"
  end
  
  
  private
    def get_the_time
      @time = Time.new.to_s
    end

end
