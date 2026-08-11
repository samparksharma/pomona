import "./FruitSidebar.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FruitSidebar() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState("overview");

  const sections = [
    { id: "overview", label: "Overview" },
    {
      id: "history",
      label: "Origin & History",
    },
    { id: "nutrition", label: "Nutrition" },
    {
      id: "growing",
      label: "Growing Conditions",
    },
    { id: "harvest", label: "Harvest" },
    { id: "diseases", label: "Diseases" },
    {
      id: "companion",
      label: "Companion Plants",
    },
    {
      id: "cultivars",
      label: "Cultivars",
    },
    {
      id: "facts",
      label: "Interesting Facts",
    },
    {
      id: "science",
      label: "Scientific Facts",
    },
    { id: "gallery", label: "Gallery" },
    {
      id: "references",
      label: "References",
    },
  ];

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(
                entry.target.id
              );
            }
          });
        },
        {
          threshold: 0.4,
        }
      );

    sections.forEach((section) => {
      const element =
        document.getElementById(
          section.id
        );

      if (element) {
        observer.observe(element);
      }
    });

    return () =>
      observer.disconnect();
  }, []);

  return (
    <aside className="fruit-sidebar">
     
      <h3>
        <b>Contents</b>
      </h3>

      <br />

      <nav>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={
              activeSection ===
              section.id
                ? "active"
                : ""
            }
          >
            {section.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default FruitSidebar;