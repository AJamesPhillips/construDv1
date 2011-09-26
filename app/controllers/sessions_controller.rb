class SessionsController < ApplicationController
  
  
  def new
    @title = "Sign in"
  end
  
  
  def create    
    user = User.authenticate(params[:session]) ## contains params[:session][:email], and params[:session][:password]
    if user.nil?      
      flash[:error] = "Invalid email/password combination."      
      @title = "Sign in"      
      redirect_to signin_path
    else      
      sign_in user      
      redirect_back_or root_path
    end  
  end
  
  
  def destroy
    sign_out
    redirect_to root_path
  end
  
  
end
