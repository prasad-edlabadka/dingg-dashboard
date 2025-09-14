import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { TokenContext } from "../../App";

function ModernNavBar({
  navs,
}: {
  navs: { name: string; icon: any; link: string; iconProps?: object; onClick?: any }[];
}) {
  const { token, navOption, setNavOption } = useContext(TokenContext);
  const activeIndex = navs.findIndex((n) => n.name === navOption);

  const dockRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Measure and position the pill under the active tab using RAF to ensure layout is settled
  const updateIndicator = useCallback(() => {
    const container = dockRef.current;
    const activeEl = itemRefs.current[activeIndex] as HTMLElement | null;
    if (!container || !activeEl) return;
    const cRect = container.getBoundingClientRect();
    const iRect = activeEl.getBoundingClientRect();
    const left = Math.round(iRect.left - cRect.left);
    const width = Math.round(iRect.width);
    setIndicator({ left, width });
  }, [activeIndex]);

  const rafUpdate = useCallback(() => {
    // double RAF to capture post-layout position for smoother transitions
    requestAnimationFrame(() => requestAnimationFrame(updateIndicator));
  }, [updateIndicator]);

  useLayoutEffect(() => {
    rafUpdate();
  }, [activeIndex, navs.length, rafUpdate]);

  useEffect(() => {
    const onResize = () => rafUpdate();
    window.addEventListener("resize", onResize);
    // initial measure on mount
    rafUpdate();
    return () => window.removeEventListener("resize", onResize);
  }, [rafUpdate]);

  return (
    <>
      {token !== null ? (
        <Navbar
          as="nav"
          expand="lg"
          collapseOnSelect
          fixed="bottom"
          data-testid="navbar-parent"
          className="diwa-floating-dock glass-effect indicator-only"
        >
          <Container className="dock dock--use-indicator" data-active-index={activeIndex} ref={dockRef}>
            {navs.map((nav, idx) => {
              const active = navOption === nav.name;
              return (
                <Nav.Link
                  key={nav.name}
                  href={`#${nav.name}`}
                  data-testid="nav-item"
                  className={`dock-item ${active ? "is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (!nav.onClick) {
                      setNavOption(nav.name);
                    } else {
                      nav.onClick();
                    }
                  }}
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!nav.onClick) setNavOption(nav.name);
                      else nav.onClick();
                    }
                  }}
                  ref={(el: any) => (itemRefs.current[idx] = el)}
                >
                  <span className="dock-icon" aria-hidden="true">
                    <nav.icon className="bn-icon" {...nav.iconProps} data-testid={`nav-icon-${nav.name}`} />
                  </span>
                  <span className="dock-label small" data-testid={`nav-text-${nav.name}`}>
                    {nav.name}
                  </span>
                </Nav.Link>
              );
            })}
            <span
              className="dock-indicator"
              aria-hidden="true"
              style={{ width: `${indicator.width}px`, transform: `translateX(${indicator.left}px)` }}
            />
          </Container>
        </Navbar>
      ) : (
        ""
      )}
    </>
  );
}

export default ModernNavBar;
