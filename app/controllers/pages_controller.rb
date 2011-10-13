class PagesController < ApplicationController
  
  before_filter :get_the_time
  
  def home
    @title = "Home"
    @elements =[]#User.first.elements
    
    #@oe2 = current_user.elements.other_elements(47).connections_to(47).all
    
    #@e = Element.find(61)
    #logger.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    #logger.debug(">>> @e = #{@e} \n    @oe2 = #{@oe2}  #in home of PagesController")
    #@e.refresh_belief_states
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
