"use client"

import { Link } from "react-router-dom"
import {  Github, Twitter, Linkedin, Mail, Heart } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "API", href: "#" },
      { name: "Documentation", href: "#" },
    ],
    company: [
      { name: "About", href: "#" },
      { name: "Blog", href: "/" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
    resources: [
      { name: "Help Center", href: "#" },
      { name: "Community", href: "#" },
      { name: "Guidelines", href: "#" },
      { name: "Terms", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "GDPR", href: "#" },
    ],
  }

  const socialLinks = [
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "GitHub", href: "#", icon: Github },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Email", href: "mailto:contact@blogspace.com", icon: Mail },
  ]

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col items-center text-center">
            <Link to="/" className="flex items-center space-x-2 mb-4 justify-center">
              <span className="text-xl font-bold text-gray-900">PostCraft</span>
            </Link>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
              A modern blogging platform where writers share their stories, insights, and expertise with the world. Join
              our community of passionate writers today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-primary transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
          {/* Bottom Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
              <p className="text-gray-500 text-sm text-center md:text-left">© {currentYear} PostCraft. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
