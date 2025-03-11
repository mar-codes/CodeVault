import { FiClock, FiEye, FiLock, FiGlobe, FiStar, FiGitBranch, FiHash, FiCode } from 'react-icons/fi';
import Link from 'next/link';

const CreationCard = ({ creation, viewMode }) => {
  const statusColors = {
    active: 'bg-green-500',
    archived: 'bg-gray-400',
    draft: 'bg-yellow-500'
  };

  return (
    <div className={`group relative bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 
      backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/30 
      hover:border-gray-600/50 transition-all duration-300 
      ${viewMode === 'list' ? 'p-4 flex gap-4' : 'p-6'}`}
    >
      <div className="absolute inset-0 rounded-xl bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className={`relative flex-1 ${viewMode === 'list' ? 'flex gap-6' : ''}`}>
        <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${creation.archived ? 'bg-gray-400' : 'bg-green-500'}`} />
              <span className="px-2 py-1 rounded-md bg-gray-700/50 text-sm font-medium text-gray-300">
                {creation.language || 'No language'}
              </span>
              {creation.tags && creation.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <FiHash className="text-gray-500" />
                  <span className="text-sm text-gray-400">{creation.tags.length} tags</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {creation.privacy === 'private' ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-400">
                  <FiLock className="w-4 h-4" />
                  <span className="text-xs font-medium">Private</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-400">
                  <FiGlobe className="w-4 h-4" />
                  <span className="text-xs font-medium">Public</span>
                </span>
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2 text-gray-100">
            {creation.title || 'Untitled Project'}
          </h2>
          <p className="text-gray-400 mb-4 line-clamp-2">
            {creation.description || 'No description provided'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Code Metadata */}
            {creation.metadata && (
              <>
                <div className="flex items-center gap-2">
                  <FiCode className="text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {creation.metadata.lines || 0} lines
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{"{ }"}</span>
                  <span className="text-sm text-gray-400">
                    {creation.metadata.characters || 0} chars
                  </span>
                </div>
              </>
            )}
            {/* Favorites Count */}
            <div className="flex items-center gap-2">
              <FiStar className="text-gray-500" />
              <span className="text-sm text-gray-400">
                {creation.favorites || 0} favorites
              </span>
            </div>
            {/* Creation Date */}
            <div className="flex items-center gap-2">
              <FiClock className="text-gray-500" />
              <span className="text-sm text-gray-400">
                {new Date(creation.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Last Updated & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
            <span className="text-sm text-gray-400">
              Updated {creation.updatedAt ? new Date(creation.updatedAt).toLocaleDateString() : 'Never'}
            </span>
            <div className="flex items-center gap-4">
              <Link
                href={`/creation/edit/${creation._id}`}
                className="px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 
                  hover:text-gray-200 font-medium text-sm group flex items-center gap-1 transition-all"
              >
                Edit
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
              <Link
                href={`/creation/${creation._id}`}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                  hover:text-blue-300 font-medium text-sm group flex items-center gap-1 transition-all"
              >
                View
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreationCard;
