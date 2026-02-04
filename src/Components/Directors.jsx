import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Globe, 
  Zap, 
  Sparkles, 
  Code,
  Cpu,
  Users,
  Award,
  Target,
  Heart
} from "lucide-react";

export default function TeamSection() {
  const [activeMember, setActiveMember] = useState(0);

  const teamMembers = [
    {
      name: "Sharwan Kumar",
      role: "Founder & Lead Developer",
      bio: "Passionate about building tools that solve real-world productivity challenges. Created HiSuru to solve the fragmentation in modern workflow tools.",
      image: "src/assets/profilePhoto.jpg",
      expertise: ["Full Stack Development", "AI/ML", "Product Design", "DevOps"],
      social: {
        github: "https://github.com/sharwan",
        twitter: "https://twitter.com/sharwan",
        linkedin: "https://linkedin.com/in/sharwan",
        website: "https://sharwan.dev"
      },
      stats: {
        years: 8,
        projects: 50,
        commits: "10K+"
      }
    }
    // {
    //   name: "Alex Chen",
    //   role: "AI/ML Engineer",
    //   bio: "Specializes in machine learning algorithms and natural language processing. Leads our AI-powered feature development.",
    //   image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    //   expertise: ["Machine Learning", "NLP", "Data Engineering", "Python"],
    //   social: {
    //     github: "https://github.com/alexchen",
    //     twitter: "https://twitter.com/alexchen",
    //     linkedin: "https://linkedin.com/in/alexchen"
    //   },
    //   stats: {
    //     years: 6,
    //     projects: 35,
    //     commits: "8K+"
    //   }
    // },
    // {
    //   name: "Sarah Johnson",
    //   role: "UX/UI Designer",
    //   bio: "Creates intuitive and beautiful interfaces that make complex workflows simple and enjoyable to use.",
    //   image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    //   expertise: ["User Research", "UI Design", "Prototyping", "Design Systems"],
    //   social: {
    //     github: "https://github.com/sarahj",
    //     twitter: "https://twitter.com/sarahj",
    //     linkedin: "https://linkedin.com/in/sarahj",
    //     dribbble: "https://dribbble.com/sarahj"
    //   },
    //   stats: {
    //     years: 7,
    //     projects: 40,
    //     commits: "5K+"
    //   }
    // }
  ];

  const teamPrinciples = [
    {
      icon: Target,
      title: "User-First Approach",
      description: "Every feature is designed with real user needs in mind"
    },
    {
      icon: Heart,
      title: "Passion for Excellence",
      description: "We obsess over details to deliver exceptional quality"
    },
    {
      icon: Sparkles,
      title: "Innovation Driven",
      description: "Constantly exploring new technologies to solve problems"
    },
    {
      icon: Users,
      title: "Collaborative Spirit",
      description: "Great products are built by great teams working together"
    }
  ];

  const technologies = [
    "React", "Node.js", "Python", "TensorFlow", "PostgreSQL", "AWS", "Docker", "Redis"
  ];

  return (
    <div className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6">
            <Users className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-semibold text-gray-700">
              Meet the team behind HiSuru
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Passionate team building
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              your productivity partner
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're a small but mighty team of developers, designers, and AI specialists 
            dedicated to creating tools that genuinely improve how teams work.
          </p>
        </div>

        {/* Team Members */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              onMouseEnter={() => setActiveMember(index)}
              className={`relative group bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent ${
                activeMember === index ? 'ring-2 ring-blue-500 shadow-xl' : ''
              }`}
            >
              {/* Member Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex justify-between text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold">{member.stats.years}+</div>
                      <div className="text-xs opacity-90">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{member.stats.projects}+</div>
                      <div className="text-xs opacity-90">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{member.stats.commits}</div>
                      <div className="text-xs opacity-90">Commits</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{member.bio}</p>

                {/* Expertise */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-3">
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.website && (
                      <a
                        href={member.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                    Active
                  </div>
                </div>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 transform rotate-45 translate-x-8 -translate-y-8 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Founder's Story */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl overflow-hidden mb-20">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="ml-4 text-2xl font-bold text-white">Our Journey</h3>
              </div>
              
              <blockquote className="text-gray-300 text-lg leading-relaxed mb-6">
                "HiSuru was born from my own frustration with scattered productivity tools. 
                As a developer juggling multiple projects, I needed a unified platform that 
                could handle everything from meetings to expenses. What started as a personal 
                solution has grown into a tool helping thousands of teams worldwide."
              </blockquote>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                  <img
                    src={teamMembers[0].image}
                    alt={teamMembers[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-white">{teamMembers[0].name}</div>
                  <div className="text-blue-300">{teamMembers[0].role}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 md:p-12">
              <h4 className="text-xl font-bold text-white mb-6">Our Principles</h4>
              <div className="space-y-6">
                {teamPrinciples.map((principle, index) => {
                  const Icon = principle.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="p-2 rounded-lg bg-white/10 mr-4">
                        <Icon className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-1">{principle.title}</h5>
                        <p className="text-gray-300 text-sm">{principle.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Built with modern technology
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We leverage cutting-edge technologies to deliver a fast, reliable, and scalable platform
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {technologies.map((tech, index) => (
              <div
                key={tech}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center">
                  <Cpu className="w-5 h-5 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-gray-900">{tech}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
              <h4 className="text-xl font-bold text-gray-900">We're hiring!</h4>
            </div>
            <p className="text-gray-600 mb-6">
              Passionate about building productivity tools? Join our small team making a big impact.
            </p>
            <a
              href="/careers"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
              View Open Positions
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}