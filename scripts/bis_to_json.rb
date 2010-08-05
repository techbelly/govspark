#!/usr/bin/env ruby
require 'rubygems'
require 'open-uri'
require 'csv'
require 'json'

class NilClass
  def strip
    nil
  end
end

days = []
open("http://www.stark.co.uk/government/DWP/Reports/DYTS01_kWh.csv") do |f|
  found_headings = false
  while (line=f.gets)
    fields = CSV.parse_line(line).map{|m| m.strip }
    next if fields.size < 10
    unless found_headings
      headings = fields
      found_headings = true
    else
      days << Hash[*headings.zip(fields).flatten]
    end
  end  
end
puts days.to_json