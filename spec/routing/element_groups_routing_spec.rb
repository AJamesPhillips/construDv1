require "spec_helper"

describe ElementGroupsController do
  describe "routing" do

    it "recognizes and generates #index" do
      { :get => "/element_groups" }.should route_to(:controller => "element_groups", :action => "index")
    end

    it "recognizes and generates #new" do
      { :get => "/element_groups/new" }.should route_to(:controller => "element_groups", :action => "new")
    end

    it "recognizes and generates #show" do
      { :get => "/element_groups/1" }.should route_to(:controller => "element_groups", :action => "show", :id => "1")
    end

    it "recognizes and generates #edit" do
      { :get => "/element_groups/1/edit" }.should route_to(:controller => "element_groups", :action => "edit", :id => "1")
    end

    it "recognizes and generates #create" do
      { :post => "/element_groups" }.should route_to(:controller => "element_groups", :action => "create")
    end

    it "recognizes and generates #update" do
      { :put => "/element_groups/1" }.should route_to(:controller => "element_groups", :action => "update", :id => "1")
    end

    it "recognizes and generates #destroy" do
      { :delete => "/element_groups/1" }.should route_to(:controller => "element_groups", :action => "destroy", :id => "1")
    end

  end
end
