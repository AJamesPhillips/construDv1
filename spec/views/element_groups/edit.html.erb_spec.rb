require 'spec_helper'

describe "element_groups/edit.html.erb" do
  before(:each) do
    @element_group = assign(:element_group, stub_model(ElementGroup))
  end

  it "renders the edit element_group form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => element_groups_path(@element_group), :method => "post" do
    end
  end
end
