import React from 'react'

const CANDIDATE_NAME = 'Waqas Ahmad'

const Footer = () => {
  return (
    <footer className="border-t border-stone-300 border-solid mt-auto">
      <div className="flex flex-col gap-4 max-w-[1208px] w-full mx-auto pt-10 pb-6 px-6 md:gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:gap-6 w-full">
          <div className="w-full md:w-[47%]">
            <ul className="flex flex-wrap gap-3.5 list-none pl-0">
              <li>
                <a href="/" className="flex items-center">
                  <span className="text-2xl font-black text-blue-700 tracking-tight">WX</span>
                </a>
              </li>
              <li>
                <a href="/" className="flex items-center">
                  <span className="text-sm font-semibold text-neutral-600">Weathex</span>
                </a>
              </li>
            </ul>

            <p className="text-neutral-800 font-medium tracking-[-0.32px] leading-[20.8px] my-5">
              <b>Weathex – Hyper-local weather intelligence.</b> Plan your day with confidence using real-time data and an accurate 7-day forecast.
            </p>
          </div>

          <div className="bg-neutral-800/10 h-px w-full md:h-auto md:w-px"></div>

          <div className="w-full md:w-[53%]">
            <p className="text-xl font-semibold leading-[23px]">About this project</p>

            <p className="text-neutral-800 text-sm leading-[20.8px] mt-3">
              Built by <b>{CANDIDATE_NAME}</b> as a technical assessment submission.
            </p>

            <p className="text-stone-500 text-sm leading-[20.8px] mt-3">
              <b className="text-neutral-800">About PM Accelerator:</b> Product Manager Accelerator (PMA)
              is a career-development program that helps aspiring and current product managers break
              into and grow in the field. Led by Dr. Nancy Li, PMA offers mentorship, hands-on projects,
              and interview coaching to help members land and advance in PM roles across the tech industry.
            </p>

            <a
              href="https://www.linkedin.com/school/pmaccelerator/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-blue-700 mt-3 hover:underline"
            >
              PM Accelerator on LinkedIn →
            </a>
          </div>
        </div>

        <div className="bg-neutral-800/10 h-px w-full"></div>
      </div>

    </footer>
  )
}

export default Footer