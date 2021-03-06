import {
  ArrowNarrowRightIcon,
  CodeIcon,
  DocumentTextIcon,
} from '@heroicons/react/solid';
import Link from 'next/link';

const CallToAction = () => {
  return (
    <div className="max-w-xl mx-auto mt-5 sm:flex sm:justify-center md:mt-8">
      <div className="rounded-md">
        <Link href="/documentation/getting-started">
          <a className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white no-underline bg-black border border-transparent rounded-md dark:bg-white dark:text-black betterhover:dark:hover:bg-gray-300 betterhover:hover:bg-gray-700 md:py-3 md:text-lg md:px-10 md:leading-6">
            <DocumentTextIcon className="h-5" />
            <span className="px-1 md:px-2">Documentation</span>
            <ArrowNarrowRightIcon className="h-4" />
          </a>
        </Link>
      </div>
      <div className="relative mt-3 rounded-md sm:mt-0 sm:ml-3">
        <Link href="https://github.com/conceptadev/rockets">
          <a
            target="_blank"
            className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white no-underline bg-black border border-transparent rounded-md dark:bg-white dark:text-black betterhover:dark:hover:bg-gray-300 betterhover:hover:bg-gray-700 md:py-3 md:text-lg md:px-10 md:leading-6"
          >
            <CodeIcon className="h-5" />
            <span className="px-1 md:px-2">Source Code</span>
            <ArrowNarrowRightIcon className="h-4" />
          </a>
        </Link>
      </div>
    </div>
  );
};

export default CallToAction;
