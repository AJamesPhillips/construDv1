require 'spec_helper'

# This spec was generated by rspec-rails when you ran the scaffold generator.
# It demonstrates how one might use RSpec to specify the controller code that
# was generated by the Rails when you ran the scaffold generator.

describe ElementGroupsController do

  def mock_element_group(stubs={})
    @mock_element_group ||= mock_model(ElementGroup, stubs).as_null_object
  end

  describe "GET index" do
    it "assigns all element_groups as @element_groups" do
      ElementGroup.stub(:all) { [mock_element_group] }
      get :index
      assigns(:element_groups).should eq([mock_element_group])
    end
  end

  describe "GET show" do
    it "assigns the requested element_group as @element_group" do
      ElementGroup.stub(:find).with("37") { mock_element_group }
      get :show, :id => "37"
      assigns(:element_group).should be(mock_element_group)
    end
  end

  describe "GET new" do
    it "assigns a new element_group as @element_group" do
      ElementGroup.stub(:new) { mock_element_group }
      get :new
      assigns(:element_group).should be(mock_element_group)
    end
  end

  describe "GET edit" do
    it "assigns the requested element_group as @element_group" do
      ElementGroup.stub(:find).with("37") { mock_element_group }
      get :edit, :id => "37"
      assigns(:element_group).should be(mock_element_group)
    end
  end

  describe "POST create" do
    describe "with valid params" do
      it "assigns a newly created element_group as @element_group" do
        ElementGroup.stub(:new).with({'these' => 'params'}) { mock_element_group(:save => true) }
        post :create, :element_group => {'these' => 'params'}
        assigns(:element_group).should be(mock_element_group)
      end

      it "redirects to the created element_group" do
        ElementGroup.stub(:new) { mock_element_group(:save => true) }
        post :create, :element_group => {}
        response.should redirect_to(element_group_url(mock_element_group))
      end
    end

    describe "with invalid params" do
      it "assigns a newly created but unsaved element_group as @element_group" do
        ElementGroup.stub(:new).with({'these' => 'params'}) { mock_element_group(:save => false) }
        post :create, :element_group => {'these' => 'params'}
        assigns(:element_group).should be(mock_element_group)
      end

      it "re-renders the 'new' template" do
        ElementGroup.stub(:new) { mock_element_group(:save => false) }
        post :create, :element_group => {}
        response.should render_template("new")
      end
    end
  end

  describe "PUT update" do
    describe "with valid params" do
      it "updates the requested element_group" do
        ElementGroup.stub(:find).with("37") { mock_element_group }
        mock_element_group.should_receive(:update_attributes).with({'these' => 'params'})
        put :update, :id => "37", :element_group => {'these' => 'params'}
      end

      it "assigns the requested element_group as @element_group" do
        ElementGroup.stub(:find) { mock_element_group(:update_attributes => true) }
        put :update, :id => "1"
        assigns(:element_group).should be(mock_element_group)
      end

      it "redirects to the element_group" do
        ElementGroup.stub(:find) { mock_element_group(:update_attributes => true) }
        put :update, :id => "1"
        response.should redirect_to(element_group_url(mock_element_group))
      end
    end

    describe "with invalid params" do
      it "assigns the element_group as @element_group" do
        ElementGroup.stub(:find) { mock_element_group(:update_attributes => false) }
        put :update, :id => "1"
        assigns(:element_group).should be(mock_element_group)
      end

      it "re-renders the 'edit' template" do
        ElementGroup.stub(:find) { mock_element_group(:update_attributes => false) }
        put :update, :id => "1"
        response.should render_template("edit")
      end
    end
  end

  describe "DELETE destroy" do
    it "destroys the requested element_group" do
      ElementGroup.stub(:find).with("37") { mock_element_group }
      mock_element_group.should_receive(:destroy)
      delete :destroy, :id => "37"
    end

    it "redirects to the element_groups list" do
      ElementGroup.stub(:find) { mock_element_group }
      delete :destroy, :id => "1"
      response.should redirect_to(element_groups_url)
    end
  end

end
