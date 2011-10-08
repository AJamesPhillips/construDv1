class PagesController < ApplicationController
  
  before_filter :get_the_time
  
  def home
    @title = "Home"
    @elements = User.first.elements
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
