require 'spec_helper'

describe "element_groups/show.html.erb" do
  before(:each) do
    @element_group = assign(:element_group, stub_model(ElementGroup))
  end

  it "renders attributes in <p>" do
    render
  end
end
